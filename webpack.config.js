const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  experiments: {
    outputModule: true
  },
  entry: [
    './src/app/index.js', 
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'dist'),
    library: {
      //name: "schmittomat",
      type: 'module'
    }
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/cmajor/*.cmajor*", 
          to: "[name][ext]",
        },
      ],
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: false,
    port: 9000,
    hot: true,
  },
};