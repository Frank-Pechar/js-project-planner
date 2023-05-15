class DOMHelper {
  // clear event listener by re-creating button element
  static clearEventListeners(element) {
    // return replaced html content of button with clone copy
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }

  // move li element to the other ul element
  static moveElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationElement = document.querySelector(newDestinationSelector);
    destinationElement.append(element);
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// base class for Tooltip class
class Component {
  constructor(hostElementId, insertBefore = false) {
    // assign dom insertion position
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }
    this.insertBefore = insertBefore;
  }

  // removes tooltip element from DOM
  detach() {
    if (this.element) {
      this.element.remove();
      // this.element.parentElement.removeChild(this.element);
    }
  }

  // insert tooltip element into DOM
  attach() {
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? 'afterbegin' : 'beforeend',
      this.element
    );
  }
}

class Tooltip extends Component {
  constructor(closeNotifierFunction, text, hostElementId) {
    super(hostElementId);
    // function to set boolean to track if notifier already open
    this.closeNotifier = closeNotifierFunction;
    // assign tooltip text already retrieved from dom
    this.text = text;
    // create tooltip element
    this.create();
  }

  // remove tooltip element from DOM and reset active tooltip flag
  closeTooltip = () => {
    this.detach();
    this.closeNotifier();
  };

  create() {
    // create tooltip element
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'card';

    // retrieve elements from a html template and assign tooltip text to paragraph element within, then insert the elements within div element created above
    const tooltipTemplate = document.getElementById('tooltip');
    const tooltipBody = document.importNode(tooltipTemplate.content, true);
    tooltipBody.querySelector('p').textContent = this.text;
    tooltipElement.append(tooltipBody);

    // determine tooltip positioning
    const hostElPosLeft = this.hostElement.offsetLeft;
    const hostElPosTop = this.hostElement.offsetTop;
    const hostElHeight = this.hostElement.clientHeight;
    const parentElementScrolling = this.hostElement.parentElement.scrollTop;

    const x = hostElPosLeft + 20;
    const y = hostElPosTop + hostElHeight - parentElementScrolling - 10;

    // assign tooltip positioning calculated from above
    tooltipElement.style.position = 'absolute';
    tooltipElement.style.left = x + 'px'; // 500px
    tooltipElement.style.top = y + 'px';

    // assign event listener to tooltip so it can be closed if clicked on
    tooltipElement.addEventListener('click', this.closeTooltip);

    // assign tooltip element to be rendered
    this.element = tooltipElement;
  }
}

// class for:
// project item instance objects
class ProjectItem {
  hasActiveTooltip = false;

  constructor(id, updateProjectListsFunction, type) {
    this.id = id;
    this.updateProjectListsHandler = updateProjectListsFunction;

    // add click handler - showMoreInfoHandler()
    this.connectMoreInfoButton();

    // add click handler - will either be:
    // activeProjectsList.switchProject() - or
    // finishedProjectsList.switchProject()
    this.connectSwitchButton(type);

    // add dragstart event handling
    this.connectDrag();
  }

  showMoreInfoHandler() {
    // return if tooltip already displayed
    if (this.hasActiveTooltip) {
      return;
    }

    // get data text for tooltip from dom element
    const projectElement = document.getElementById(this.id);
    const tooltipText = projectElement.dataset.extraInfo;

    // create tooltip object
    const tooltip = new Tooltip(
      () => {
        this.hasActiveTooltip = false;
      },
      tooltipText,
      this.id
    );

    // render tooltip
    tooltip.attach();
    this.hasActiveTooltip = true;
  }

  // add handler for 'dragstart' to allow move for li element from one list
  // to the other list
  connectDrag() {
    const item = document.getElementById(this.id);
    item.addEventListener('dragstart', (event) => {
      // capture the id of the li element to be dragged
      event.dataTransfer.setData('text/plain', this.id);
      event.dataTransfer.effectAllowed = 'move';
    });

    // no need for 'dragend' event handling
    // item.addEventListener('dragend', (event) => {
    //   console.log(event);
    // });
  }

  // add click event handler for More Info button
  connectMoreInfoButton() {
    const projectItemElement = document.getElementById(this.id);
    const moreInfoBtn = projectItemElement.querySelector(
      'button:first-of-type'
    );
    moreInfoBtn.addEventListener('click', this.showMoreInfoHandler.bind(this));
  }

  // add click event handler for either Finish or Activate button
  connectSwitchButton(type) {
    const projectItemElement = document.getElementById(this.id);
    let switchBtn = projectItemElement.querySelector('button:last-of-type');

    // replace button with clone copy then assign new reference pointer to switchBtn
    // this will dump any event listeners
    switchBtn = DOMHelper.clearEventListeners(switchBtn);

    // switch text content of button
    switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';

    // click event handler - 'updateProjectListsHandler' - will either be:
    // activeProjectsList.switchProject() - or
    // finishedProjectsList.switchProject()
    switchBtn.addEventListener(
      'click',
      this.updateProjectListsHandler.bind(null, this.id)
    );
  }

  update(updateProjectListsFn, type) {
    // save switchProject function into other ProjectList instance
    this.updateProjectListsHandler = updateProjectListsFn;

    // update event handling and text content of switch button
    this.connectSwitchButton(type);
  }
}

// class for:
// activeProjectsList and finishedProjectsList
// project instance lists objects
class ProjectList {
  // projects array for list items for each project list
  projects = [];

  // type - of project: active or finished
  constructor(type) {
    this.type = type;
    // get html li items for active or finished
    const prjItems = document.querySelectorAll(`#${type}-projects li`);
    // fill projects array with ProjectItem objects
    for (const prjItem of prjItems) {
      this.projects.push(
        // create new project item object and populate with id and a function
        // switchProject - bind current ProjectList object and type
        new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type)
      );
    }
    // console.log(this.projects);
    this.connectDroppable();
  }

  connectDroppable() {
    // list = ul for either active or finished list
    const list = document.querySelector(`#${this.type}-projects ul`);

    // dragenter event handling for ul
    list.addEventListener('dragenter', (event) => {
      // check for correct data type to be dropped
      if (event.dataTransfer.types[0] === 'text/plain') {
        // change background color for section of ul
        list.parentElement.classList.add('droppable');
        event.preventDefault();
      }
    });

    // dragover event handling for ul
    list.addEventListener('dragover', (event) => {
      // check for correct data type to be dropped
      if (event.dataTransfer.types[0] === 'text/plain') {
        event.preventDefault();
      }
    });

    // dragleave event handling for ul
    list.addEventListener('dragleave', (event) => {
      // if origin ul is no longer the parent of dragged element during drag
      // operation then can reset the normal background color
      if (event.relatedTarget.closest(`#${this.type}-projects ul`) !== list) {
        list.parentElement.classList.remove('droppable');
      }
    });

    // drag drop event handling for ul
    list.addEventListener('drop', (event) => {
      // prjId = id of li element dragged
      const prjId = event.dataTransfer.getData('text/plain');

      // if prjId is in current object instance, then li element has not been dragged to the other ul list - return
      if (this.projects.find((p) => p.id === prjId)) {
        return;
      }

      // if drop - then - click the oposite button for activate or finish to perform logic for moving the dom li element to other ul list
      document
        .getElementById(prjId)
        .querySelector('button:last-of-type')
        .click();

      // operation then can reset the normal background color
      list.parentElement.classList.remove('droppable');
      // event.preventDefault(); // not required
    });
  }

  // set the pointer to addProject function to point to other ProjectList object
  // so that ProjectItem can be added to the other ProjectList object
  // activeProjectsList.switchHandler = finishedProjectList.addProject()
  // finishedProjectsList.switchHandler = activeProjectList.addProject()
  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  // object references bound to add project to other list object
  addProject(project) {
    // add project to other array of projects
    this.projects.push(project);

    // move li element to other ul element
    DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);

    // perform button switch and save switchProject function for future moves
    project.update(this.switchProject.bind(this), this.type);
  }

  switchProject(projectId) {
    // const projectIndex = this.projects.findIndex(p => p.id === projectId);
    // this.projects.splice(projectIndex, 1);

    // find project in projects array and perform addProject function to move project to other array and move dom li element to other ul element
    this.switchHandler(this.projects.find((p) => p.id === projectId));
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}

class App {
  static init() {
    // create objects for active and finished project lists
    const activeProjectsList = new ProjectList('active');
    const finishedProjectsList = new ProjectList('finished');

    // bind finishedProjectsList.addProject to activeProjectsList
    activeProjectsList.setSwitchHandlerFunction(
      finishedProjectsList.addProject.bind(finishedProjectsList)
    );

    // bind activeProjectsList.addProject to finishedProjectsList
    finishedProjectsList.setSwitchHandlerFunction(
      activeProjectsList.addProject.bind(activeProjectsList)
    );
  }
}

// Begin Execution of App
App.init();
