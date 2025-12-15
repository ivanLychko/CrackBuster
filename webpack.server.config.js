const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = (env, argv) => {
  return {
    entry: './server/index.js',
    target: 'node',
    externals: [nodeExternals()],
    output: {
      path: path.resolve(__dirname, 'dist/server'),
      filename: 'server.js',
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
          use: 'ignore-loader',
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|mp4|woff|woff2|eot|ttf|otf)$/,
          use: 'ignore-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    watch: argv.watch || false,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: 1000,
    },
  };
};
