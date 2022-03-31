const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

const itkSource = path.join(__dirname, 'node_modules', 'itk');
const itkDestination = path.join(__dirname, 'dist', 'itk');

module.exports = {
  // It is suggested to run both `react-refresh/babel` and the plugin in the `development` mode only,
  // even though both of them have optimisations in place to do nothing in the `production` mode.
  // If you would like to override Webpack's defaults for modes, you can also use the `none` mode -
  // you then will need to set `forceEnable: true` in the plugin's options.
  externals: [{ fs: 'commonjs fs' }],
  mode: isDevelopment ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
            },
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    // ... other plugins
    isDevelopment && new webpack.HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(itkSource, 'WebWorkers'),
          to: path.join(itkDestination, 'WebWorkers'),
        },
        {
          from: path.join(itkSource, 'ImageIOs'),
          to: path.join(itkDestination, 'ImageIOs'),
        },
        {
          from: path.join(itkSource, 'MeshIOs'),
          to: path.join(itkDestination, 'MeshIOs'),
        },
        {
          from: path.join(itkSource, 'PolyDataIOs'),
          to: path.join(itkDestination, 'PolyDataIOs'),
        },
        {
          from: path.join(itkSource, 'Pipelines'),
          to: path.join(itkDestination, 'Pipelines'),
        },
      ],
    }),
  ].filter(Boolean),
  // ... other configuration options
};
