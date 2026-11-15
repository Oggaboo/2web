const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// 2Web build: everything relative (rule 2.2), no source maps, no service worker.
module.exports = {
  entry: "./js/bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist/sand-garden"),
    filename: "game.js",
    chunkFilename: "game.[name].js",
    webassemblyModuleFilename: "sand.wasm",
    publicPath: "",
    clean: true,
  },
  experiments: { asyncWebAssembly: true },
  devtool: false,
  performance: { hints: false },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "index.html", info: { minimized: true } }, { from: "js/styles.css", info: { minimized: true } }, "2web.json", "thumb.webp", "cover.jpg", { from: "LICENSE", to: "LICENSE.txt", toType: "file" }],
    }),
  ],
  module: {
    rules: [
      { test: /\.(glsl|frag|vert)$/, type: "asset/source", use: "glslify-loader", exclude: /node_modules/ },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader", options: { presets: ["@babel/preset-env", "@babel/preset-react"] } },
      },
    ],
  },
};
