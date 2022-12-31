const path = require('path');
module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(png|jpe?g|gif|bin|glb|fbx)$/,
        use: [
          {
            loader: "url-loader"
          }
        ]
      }
    ]
  },
  devServer: {
    static: [
      path.join(__dirname, 'dist'), 
      path.join(__dirname, 'static/models'),
      path.join(__dirname, 'static/textures')
    ],
    open: true
  }
};