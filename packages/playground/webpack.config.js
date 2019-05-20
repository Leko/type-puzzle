/* eslint-env node */
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const theme = require("./theme");

module.exports = {
  entry: {
    app: "./src/index.tsx"
  },
  mode: "development",
  devtool: "inline-source-map",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.[name].js",
    chunkFilename: "bundle.[name].js"
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
      // inject: false,
      template: require("html-webpack-template"),

      lang: "en",
      title:
        "TypeScript Playground | The unofficial playground for advanced TypeScript users",
      appMountId: "root",
      googleAnalytics: {
        trackingId: "UA-140408943-1",
        pageViewOnLoad: true
      }
    })
  ]
};
