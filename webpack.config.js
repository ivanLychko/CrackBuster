const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './client/src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist/client'),
      filename: isProduction ? 'bundle.[contenthash].js' : 'bundle.js',
      publicPath: '/',
      clean: !argv.watch, // Don't clean in watch mode
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.(scss|sass|css)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  silenceDeprecations: ['legacy-js-api', 'import']
                }
              }
            }
          ],
        },
      {
        test: /\.(png|jpg|jpeg|gif|svg|mp4)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
      },
    ],
  },
    plugins: [
      new HtmlWebpackPlugin({
        template: './client/public/index.html',
        filename: 'index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'client/public/images'),
            to: path.resolve(__dirname, 'dist/client/images'),
            noErrorOnMissing: true,
          },
        ],
      }),
      ...(isProduction 
        ? [new MiniCssExtractPlugin({ filename: 'bundle.[contenthash].css' })]
        : []
      ),
    ],
    watch: argv.watch || false,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devServer: {
      port: 3001,
      hot: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'client/public'),
        publicPath: '/',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
};

