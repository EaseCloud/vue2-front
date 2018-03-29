/* 程序配置 */
export default {
  // 平台标识符，暂用于区分菜单
  project: '[未命名项目]',
  // API Root，指定后台地址
  // api_root: (process.env.NODE_ENV === 'production') ? '/api' : 'http://127.0.0.1:8000/api',
  api_root: '/api',
  // 多套 API
  // api: {
  //   site_a: 'http://a.example.com/api',
  //   site_b: 'http://b.example.com/api',
  //   site_c: 'http://c.example.com/api'
  // },
  // API 格式，串接在 VueResource 字符串后面的格式
  api_format: '{/id}{/action}/',
  // api model 是否自动调整 (underscore: 自动将驼峰转换为下划线格式; off: 不自动转换)
  // 缺省 underscore
  api_model_adjust: 'underscore',
  // 版本号
  version: '1.0',
  debug: true,
  components: {},
  widgets: {},
  bootstrap () {
    const vm = this
    vm.loadLocationPath(true)
  },
  // 初始登录的处理 function(vm)
  on_login (vm) {
    // vm.$router.replace(this.init_route)
  },
  // 是否传送跨域 cookie
  cross_origin: true
}
