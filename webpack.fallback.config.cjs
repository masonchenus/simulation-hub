/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("node:path");

const { EsbuildPlugin } = require("esbuild-loader");

module.exports = (env, argv) => {
  const mode = argv.mode || "development";

  return {
    mode,
    entry: path.resolve(__dirname, "src", "main.tsx"),
    devtool: mode === "development" ? "source-map" : false,
    output: {
      path: path.resolve(__dirname, "webpack-fallback"),
      filename: "bundle.js",
      publicPath: "auto",
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          loader: "esbuild-loader",
          options: {
            loader: "tsx",
            target: "es2018",
          },
        },
      ],
    },
    optimization: {
      minimize: mode === "production",
      minimizer: [new EsbuildPlugin({ target: "es2018" })],
    },
    devServer: {
      host: "127.0.0.1",
      port: 4174,
      static: {
        directory: __dirname,
      },
      client: {
        overlay: false,
      },
    },
  };
};
