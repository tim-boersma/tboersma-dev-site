const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  devServer: {
    proxy: {
      '/api': {
        // Azure Function endpoint
        target: process.env.API_BASE_URL,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api', // keep the /api path
        },
        onProxyReq: (proxyReq) => {
          // Add API key to every request (secure - never sent to client)
          const apiKey = process.env.API_FUNCTION_MASTER_KEY
          proxyReq.setHeader('x-functions-key', apiKey)
        },
      },
    },
  },
})
