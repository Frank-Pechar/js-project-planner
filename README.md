# Project Planning App 
## Javascript Project
## Desription of App Functionality, Features, and Methods

Javascript project I completed from Udemy - Javascript - The Complete Guide 2023 by Maximilian Schwarzmuller. After coding this project I added minor changes and commenting for educational purposes.

App can be run from: https://frank-pechar-js-project-planner.netlify.app

## This App Uses Javascript Features Such As:

- Drag and and Drop Projects between Active and Finished Lists
- Use Finish or Activate Buttons to Move Projects between Active and Finished Lists
- More Info Button Displays Tooltip Popup for Project
- Click on Tooltip to Remove

ARCHITECTURE: None

IMPLEMENTED the following Javascript methods and features:

- Drag and drop functionality
- Dataset and data- attributes
- HTML template tags
- Tooltip popup positioning and functionality
- DOM manipulation
- Classes and prototypal inheritance
- Cloning and re-creating DOM elements to remove event listeners
- Static methods

Side exercises performed while coding this app but not included in it:

- Dynamic script creation
- Timers and intervals
- Location and history objects and methods
- Navigator and navigator.geolocation objects and methods
- Creating and using Date and Error objects
- Event propagation and delegation
- Programmatically triggering events

- Used dragstart, dragenter, dragover, dragleave, drop addEventListeners
- event.dataTransfer.setData();
- event.dataTransfer.effectAllowed 
      
list.addEventListener('dragenter', (event) => {
      // check for correct data type to be dropped
      if (event.dataTransfer.types[0] === 'text/plain') {
        // change background color for section of ul
        list.parentElement.classList.add('droppable');
      

## Coding Methods and Features Used:

