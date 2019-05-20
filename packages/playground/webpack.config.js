/* eslint-env node */
const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin");
const WebappWebpackPlugin = require("webapp-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const theme = require("./theme");

const ENTRY_PATH = path.resolve(__dirname, "src", "index.tsx");
const DIST_PATH = path.resolve(__dirname, "dist");

module.exports = {
  entry: {
    app: ENTRY_PATH
  },
  mode: "development",
  devtool: "inline-source-map",
  output: {
    path: DIST_PATH,
    filename: "bundle.[name].[hash].js",
    chunkFilename: "bundle.[name].[chunkhash].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        // https://ant.design/docs/react/customize-theme
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          },
          {
            loader: "less-loader", // compiles Less to CSS
            options: {
              modifyVars: theme,
              javascriptEnabled: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ["typescript", "json"]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve("static", "index.html")
    }),
    new WebappWebpackPlugin({
      logo: path.resolve(__dirname, "static", "icon.png"),
      inject: true
    }),
    new PreloadWebpackPlugin(),
    new CompressionPlugin()
  ]
};
