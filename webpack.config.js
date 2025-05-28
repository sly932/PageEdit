const path = require('path');

module.exports = {
  entry: {
    popup: './src/popup/popup.ts',
    content: './src/content/content.ts',
    background: './src/background/background.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}; 