const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('dotenv').config();

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    popup: './src/popup/popup.ts',
    content: './src/content/content.ts',
    background: './src/background/background.ts',
    styles: './src/styles/main.css'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.css'],
    fallback: {
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "process": require.resolve("process/browser"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "net": false,
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "url": require.resolve("url/"),
      "worker_threads": false
    }
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup/popup.html' },
        { from: 'src/content/content.css', to: 'content/content.css' },
        { from: 'src/assets', to: 'assets' }
      ]
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        LLM_PROVIDER: JSON.stringify(process.env.LLM_PROVIDER || 'openai'),
        OPENAI_API_KEY: JSON.stringify(process.env.OPENAI_API_KEY || ''),
        OPENAI_MODEL: JSON.stringify(process.env.OPENAI_MODEL || 'gpt-4.1'),
        OPENAI_API_BASE_URL: JSON.stringify(process.env.OPENAI_API_BASE_URL || ''),
        CLAUDE_API_KEY: JSON.stringify(process.env.CLAUDE_API_KEY || ''),
        CLAUDE_MODEL: JSON.stringify(process.env.CLAUDE_MODEL || 'anthropic.claude-3-opus'),
        CLAUDE_API_BASE_URL: JSON.stringify(process.env.CLAUDE_API_BASE_URL || '')
      }
    })
  ]
}; 