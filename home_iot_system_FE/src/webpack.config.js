module.exports = {
  // Các cấu hình khác của bạn
  resolve: {
    fallback: {
      process: require.resolve("process/browser"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
};
