const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/app-pre.js',
  output: {
    // filename: '[contenthash].js', (unique name / no cache)
    filename: 'app.js',
    path: path.resolve(__dirname, 'assets', 'scripts'),
    publicPath: 'assets/scripts/',
  },
  devtool: 'source-map',
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                { useBuiltIns: 'usage', corejs: { version: 3 } },
              ],
            ],
          },
        },
      },
    ],
  },
};

// options: {
//   presets: [['@babel/preset-env', { targets: 'defaults' }]],
// },
