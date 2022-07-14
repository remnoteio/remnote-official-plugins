const { resolve } = require("path");
var glob = require("glob");
var path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ESBuildMinifyPlugin } = require("esbuild-loader");
const { ProvidePlugin, BannerPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
const isDevelopment = !isProd;

const fastRefresh = isDevelopment ? new ReactRefreshWebpackPlugin() : null;

const config = {
  mode: isProd ? "production" : "development",
  entry: glob.sync("./src/widgets/**.tsx").reduce(function (obj, el) {
    obj[path.parse(el).name] = el;
    return obj;
  }, {}),

  output: {
    path: resolve(__dirname, "dist"),
    filename: "[name].js",
    publicPath: "",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      // Use esbuild as a Babel alternative
      {
        test: /\.(ts|tsx|jsx|js)?$/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2020",
          minify: false,
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { url: false } },
          "postcss-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "App.css",
    }),
    new HtmlWebpackPlugin({
      templateContent: `
      <body></body>
      <script type="text/javascript">
      const urlSearchParams = new URLSearchParams(window.location.search);
      const queryParams = Object.fromEntries(urlSearchParams.entries());
      const widgetName = queryParams["widgetName"];
      if (widgetName == undefined) {document.body.innerHTML+="Widget ID not specified."}

      const s = document.createElement('script');
      s.type = "module";
      s.src = widgetName+".js";
      document.body.appendChild(s);
      </script>
    `,
      filename: "index.html",
      inject: false,
    }),
    new ProvidePlugin({
      React: "react",
    }),
    isProd &&
      new BannerPlugin({
        banner: "const IMPORT_META=import.meta;",
        raw: true,
      }),
    new CopyPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
    fastRefresh,
  ].filter(Boolean),
};

if (isProd) {
  // TODO: RE-ENABLE
  config.optimization = {
    minimize: true,
    minimizer: [new TerserPlugin({})],
  };
} else {
  // for more information, see https://webpack.js.org/configuration/dev-server
  config.devServer = {
    port: 8080,
    open: true,
    hot: true,
    compress: true,
    watchFiles: ["src/*"],
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}

module.exports = config;
