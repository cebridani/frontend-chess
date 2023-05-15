module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://192.168.49.2:30353",
        changeOrigin: true,
      },
    },
    port: 3000
  },
  transpileDependencies: true,
  lintOnSave: false
}
