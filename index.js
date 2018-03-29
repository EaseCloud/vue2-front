/** Absolute Imports */
// import 'font-awesome/less/font-awesome.less'
import 'animate.css'

// import VueRouter from 'vue-router'
// import Deferred from 'es6-deferred'

/** Relative Imports */
import App from './components/App.vue'

import 'reset-css'

import './assets/css/style.less'
import '../assets/css/style.less'

// TODO: 需要改写成移动端版本
// import ImageViewer from './plugins/image-viewer'
import mixins from './mixins'

import AwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.min.css'

import VueTouch from 'vue-touch'

import Notifier from './plugins/notifier'

import PageStack from './plugins/page-stack'

// 应用内配置文件
import config from '../config/config'

// Components routes and entrance
// import routes from '../config/routes'

export default {
  install (Vue, options = {}) {
    // -------------------------
    // Vue Mixin
    // -------------------------

    // [config] action_init 钩子
    if (config.action_init) {
      config.action_init(Vue)
    }

    Vue.mixin(mixins)

    // [config] action_init_mixins 钩子
    if (config.action_init_mixins) {
      config.action_init_mixins(Vue, mixins)
    }

    // -------------------------
    // Plugins
    // -------------------------
    Vue.use(AwesomeSwiper)

    Vue.use(Notifier)

    Vue.use(PageStack)

    Vue.use(VueTouch, { name: 'v-touch' })

    // -------------------------
    // Vue resource config
    // -------------------------
    // Vue.http.options.root = config.api_root || '/api'
    // if (config.cross_origin !== false) {
    //   Vue.http.options.credentials = true
    //   Vue.http.options.xhr = { withCredentials: true }
    // }

    // -------------------------
    // Vue notify http error
    // -------------------------
    // Vue.http.interceptors.push((req, next) => {
    //   const request = req
    //   // console.log(req)
    //   request.headers = request.headers || {}
    //   // console.log(request)
    //   // 对响应结果的业务处理
    //   next(response => {
    //     // console.log(response)
    //     // console.log(response.data)
    //     // console.log(response['force_logout'])
    //     // alert(response.headers.map.force_logout)
    //     if (response.data.force_logout && response.data.force_logout === 1) {
    //       // window.alert('賬戶已在其他設備登錄')
    //       window.app.notify('賬戶已在其他設備登錄')
    //       window.app.logout()
    //       // window.app.api('Member').patch({
    //       //   id: window.app.me.id,
    //       // }, {
    //       //   jpush_registration_id: '',
    //       // }).then(() => {
    //       //   window.localStorage.setItem('jpush_registration_id', '')
    //       //   window.app.logout()
    //       // })
    //       // window.app.logout()
    //       // window.app.current_user = null
    //       // window.app.$router.push({ name: 'passport_signin' })
    //       return
    //     }
    //     if (window.app && window.app.notify &&
    //       ((typeof config.report_http_error === 'undefined') || !!config.report_http_error)) {
    //       if (response.data.silent) {
    //         return response
    //       }
    //       if (response.data && response.data.msg) {
    //         // console.log(response)
    //         if (response.data.ok) {
    //           window.app.notify(response.data.msg, '接口调用成功')
    //         } else {
    //           window.app.notify(response.data.msg, '接口调用失败')
    //         }
    //       } else if (response.status >= 400) {
    //         window.app.notify(response.body, `接口调用失败：${response.status}`)
    //       }
    //     }
    //     return response
    //   })
    // })

    // ----------------------------
    // Vue http api loading counter
    // ----------------------------
    // const registerLoadingCounter = () => {
    //   let counter = 0
    //   // Loading 计数器处理
    //   Vue.http.interceptors.push((request, next) => {
    //     counter += 1
    //     if (window.app && window.app.loading && window.app.loading.show) {
    //       window.app.loading.counter = counter
    //     }
    //     next(() => {
    //       counter -= 1
    //       if (window.app && window.app.loading && window.app.loading.show) {
    //         window.app.loading.counter = counter
    //       }
    //     })
    //   })
    // }
    // registerLoadingCounter()

    // [config] action_init_http 钩子
    if (config.action_init_http) {
      config.action_init_http(Vue)
    }

    // -------------------------
    // Vue router config
    // -------------------------

    // Vue.use(VueRouter)

    // const router = new VueRouter({ routes })

    // router.beforeEach((to, from, next) => {
    //   // noReuse 模式，启用组件内参数跳转自动 reload
    //   if (to.name === from.name && window.app) {
    //     const vm = window.app.$router.app
    //     window.afterRoutePromise = new Deferred()
    //     console.log('dododo')
    //     window.afterRoutePromise.then(() => {
    //       delete window.afterRoutePromise
    //       console.log('then')
    //       console.log('before-reload', vm)
    //       if (vm.reload) {
    //         console.log('reload', vm)
    //         vm.$nextTick(() => {
    //           vm.reload()
    //         })
    //       }
    //     })
    //   }
    //   next()
    // })

    // router.afterEach(route => {
    //   // 将路由信息分级放置到 body 的 class 里面
    //   let name = 'app'
    //   let classNames = 'app'
    //   if (route.name) {
    //     route.name.split('_').forEach(str => {
    //       if (str) {
    //         name += `-${str}`
    //         classNames += ` ${name}`
    //       }
    //     })
    //   }
    //   // // 强制启动路由跳转后激活 reload
    //   // if (window.afterRoutePromise) {
    //   //   window.afterRoutePromise.resolve()
    //   // }
    //   // console.log(route)
    //   document.body.className = classNames
    //   console.log(`>>> ${route.name}`)
    // })

    // [config] action_init_router 钩子
    // if (config.action_init_router) {
    //   config.action_init_router(Vue, router)
    // }

// --------------------------------------
// Cordova Initialize Before Router Start
// --------------------------------------
    let cordovaReady = Promise.resolve()

    if (/Cordova/.test(window.navigator.userAgent)) {
      console.log('Cordova environment detected, trying to import the script.')
      cordovaReady = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          // alert('cordova timed out!!!!!');  // eslint-disable-line
          reject(new Error('cordova timed out!!!!!'))
        }, 500000)
        const script = document.createElement('script')
        script.type = 'text/javascript'
        if (!/^http/.test(window.location.href || '')) {
          script.src = 'cordova.js'
        } else if (/Android/.test(window.navigator.userAgent)) {
          script.src = 'cordova/android/cordova.js'
        } else if (/iPhone/.test(window.navigator.userAgent)) {
          script.src = 'cordova/ios/cordova.js'
        }
        script.onload = () => {
          document.addEventListener('deviceready', () => {
            clearTimeout(timeout)
            /* Plugins bootstrap */
            if (window.cordova && window.cordova.InAppBrowser) {
              console.warn('Cordova InAppBrowser loaded, you can use window.open now.')
              window.open = window.cordova.InAppBrowser.open
            }
            resolve()
          }, false)
        }
        document.body.appendChild(script)
      })
    }

    cordovaReady.then(() => {
      // [config] action_before_launch 钩子
      if (config.action_before_launch) {
        config.action_before_launch.apply(Vue)
      }
      // [config] action_cordova_ready 钩子
      if (config.action_cordova_ready) {
        config.action_cordova_ready.apply(Vue)
      }
      const AppConstructor = Vue.extend(App);  // eslint-disable-line
      // window.app = new AppConstructor({ router, el: '#app' })
      window.app = new AppConstructor({ el: '#app' })
    })
  }
}
