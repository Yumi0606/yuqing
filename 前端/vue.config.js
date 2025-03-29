var vueCliService = require('@vue/cli-service');
var defineConfig = vueCliService.defineConfig;
module.exports = defineConfig({
  transpileDependencies: true,
  // lintOnSave:false,
})
module.exports={
  devServer:{
    open:true,
    proxy:{
      '/api':{
        // target:'https://panjiachen.github.io/vue-element-admin/#/login?redirect=%2Fdashboard',
        // target:'https://rapserver.sunmi.com/app/mock/340/login',
        target:'http://192.168.1.13:8000',
        // secure: false, // 禁用 SSL 验证
        changeOrigin: true,
        // pathRewrite:{
        //   '^api':''
        // }
      }
    }
  }
}