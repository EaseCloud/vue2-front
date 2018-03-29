// Mixins
// import Deferred from 'es6-deferred'
import areaData from 'china-area-data'
// import Loading from 'vue-spinner/src/ScaleLoader.vue'
import Loading from 'vue-spinner/src/ClipLoader.vue'

import dateformat from 'dateformat'

import api from './resource/api'
import utils from './utils'

import choices from '../config/choices'
import customConfig from '../config/config'
import defaultConfig from './default_config'

const config = Object.assign(defaultConfig, customConfig)

export default {
  mounted () {
    const vm = this
    // // 输出路由情况
    // if (vm.$vnode && vm.$vnode.data.routerView) {
    //   console.log(
    //     'Route vm ready: 'z
    //     vm.$router.options.routes[vm.$vnode.data.routerViewDepth].name || '$root'
    //   )
    //   // console.log(vm.$router.options.routes)
    //   // console.log(vm.$vnode)
    // }

    // 保证 this.$el 已经插入文档
    this.$nextTick(() => {
      // [config] html_title
      document.title = vm.html_title
      // 调用 reload 函数加载数据
      if (vm.reload) vm.reload()
      // vm.clearDialogs()
    })
  },
  components: {
    Loading,
    ...(config.components || {}),
    ...(config.widgets || {})
  },
  computed: {
    $cordova () {
      return window.cordova
    },
    areaData () {
      return areaData
    },
    choices () {
      return choices
    },
    config () {
      return config
    },
    utils () {
      return utils
    },
    me: {
      get () {
        if (this.$root.$options.name === 'vue2-front') {
          return this.$root.current_user
        }
        return window.app && window.app.current_user
      },
      set (value) {
        if (this.$root.$options.name === 'vue2-front') {
          this.$root.current_user = value
        } else if (window.app) {
          window.app.current_user = value
        }
        throw new Error('Cannot get root vm object')
      }
    }
  },
  filters: {
    currency (value, note = '￥') {
      return `${note}${Number(value).toFixed(2)}`
    },
    date (value, fmt = 'yyyy-mm-dd HH:MM:ss') {
      return window.app.formatDate(value, fmt)
    },
    durationFilter (value) {
      return this.formatDuration(value)
    }
  },
  methods: {
    // [config] api_root
    api (model = this.model, api_root = this.api_root || config.api_root) {
      if (!model) {
        console.error('使用 api() 缺少参数：当前调用 vm 没有指定 model 类型')
        return null
      }
      return api(model, api_root)
    },
    formatDate (value, fmt = 'yyyy-mm-dd HH:MM:ss') {
      try {
        return dateformat(this.normalizeDate(value), fmt)
      } catch (e) {
        return value
      }
    },
    formatDuration (value, numeric = false) {
      const hours = Math.floor(value / 3600000)
      const minutes = Math.floor(value / 60000) % 60
      const seconds = Math.floor(value / 1000) % 60
      if (numeric) {
        return `${hours < 10 ? '0' + hours : hours}` +
          `:${minutes < 10 ? '0' + minutes : minutes}` +
          `:${seconds < 10 ? '0' + seconds : seconds}`
      } else {
        if (seconds < 60) {
          return `${seconds}秒`
        } else if (seconds < 3600) {
          return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
        }
      }
    },
    normalizeDate (value) {
      try {
        if (/^\d\d\d\d-\d\d-\d\d \d\d:\d\d(:\d\d)?$/.test(value)) {
          // http://stackoverflow.com/q/13363673/2544762
          const date = new Date(value.replace(' ', 'T'))
          // timezone convert
          return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
          )
        }
      } catch (e) {
        console.error(e)
        return new Date()
      }
    },
    /**
     * 验证当前登录的用户，返回已登录的用户对象
     * @param reload 是否强制询问服务器登录状态（无视缓存）
     * @returns {Promise.<T>}
     */
    authenticate (reload = false) {
      const vm = this.$root
      // 可以从 config 函数钩出这个处理方法
      // [config] action_authenticate
      if ((typeof vm.config.action_authenticate) === 'function') {
        return vm.config.action_authenticate.apply(vm, [reload])
      }
      if (vm.me && !reload) return Promise.resolve(vm.me)
      // 默认情况下调用 GET `${api_root}/user/current/` 获取当前已登录用户对象
      return api('User').get({ action: 'current' }).then(resp => {
        vm.current_user = resp.data
        return vm.me
      })
    },
    /**
     * 需要登录，否则跳转到指定的页面进行登录
     * @returns {Promise.<T>}
     */
    requireLogin (reload = false) {
      const vm = this
      // [config] route_login 登录页面的路由对象
      return vm.authenticate(reload).catch(() => {
        if (config.action_require_login instanceof Function) {
          config.action_require_login.apply(vm)
        }
        return Promise.reject(new Error('请先登录'))
      })
    },
    /**
     * 使用指定的用户名和密码登录
     * @param username
     * @param password
     * @returns {Promise.<T>}
     */
    login (username, password) {
      const vm = this.$root
      // [config] action_login 自定义的登录函数，返回 promise
      if (vm.config.action_login) {
        return vm.config.action_login.apply(vm, [username, password])
      }
      // 默认情况下调用 POST `${api_root}/user/current/` 获取当前已登录用户对象
      return api('User').save(
        { action: 'login' },
        { username, password }
      ).then(resp => {
        vm.current_user = resp.data
        return vm.me
      })
    },
    /**
     * 退出当前登录的用户
     * @returns {Promise.<T>}
     */
    logout () {
      const vm = this.$root
      // [config] action_logout 自定义的登录函数，返回 promise
      if ((typeof vm.config.action_logout) === 'function') {
        return vm.config.action_logout.apply(vm, [])
      }
      return api('User').get({ action: 'logout' }).then(() => {
        vm.current_user = null
      })
    },
    /**
     * 让一个值转换成一个返回 then 的函数
     * @param func
     * @param params
     * @returns {Promise}
     */
    thenify (func, params = []) {
      const vm = this
      // 如果 func 不是函数，直接 resolve
      if (!(func instanceof Function)) return Promise.resolve(func)
      // 否则看执行结果
      const result = func.apply(vm, params)
      if (result && (result.then instanceof Function)) return result
      return Promise.resolve(result)
    },
    /**
     * 替换 vm 对象为 this 执行一个函数作为方法调用并返回结果
     * 例如 vm.doAction(func, params)
     * @param func 执行的函数
     * @param params 参数列表
     */
    doAction (func, params) {
      const vm = this
      return func.apply(vm, params)
    },
    /**
     * 调用 Cordova 的 StatusBar，重置其状态（手动回复 iOS 的奇怪 BUG）
     */
    resetStatusBar () {
      if (window.StatusBar) {
        setTimeout(() => {
          window.StatusBar.hide()
          window.StatusBar.show()
        }, 0)
      }
    },
    updateModel (model, id, field, value, notify = '操作成功', callback = null) {
      const vm = this
      return api(model).patch({ id }, { [field]: value }).then(resp => {
        const item = resp.data
        if (notify) vm.$message.success(notify)
        if (callback) callback(item)
      })
    },
    deleteModel (model, id, confirm = '确认删除此对象？', notify = '操作成功', callback = null) {
      const vm = this
      const promise = confirm ? this.confirm(confirm) : Promise.resolve()
      return promise.then(() => {
        api(model).delete({ id }).then(() => {
          if (notify) vm.$message.success(notify)
          if (callback) callback()
        })
      })
    },
    /**
     * 获取一个对象的多级属性
     * 例如 getProperty(item, 'a.b.c') 等价于 item.a.b.c
     * 遇到错误的话返回 null
     * @param item
     * @param keyStr
     * @returns {*}
     */
    getProperty (item, keyStr) {
      // 缺省 keyStr 的时候直接返回 item
      if (!keyStr) return item
      // 执行 keyStr 级联求值
      let value = item
      if (typeof (keyStr) !== 'string') {
        console.warn('getProperty 属性的 key 取值不规范')
        console.log('keyStr:', keyStr)
        console.log('item:', item)
      }
      keyStr.split('.').forEach(key => {
        try {
          value = value && value[key] || null
        } catch (e) {
          console.error('getProperty 求值错误', e)
        }
      })
      return value
    },
    /**
     * 假定使用 vm 里面的 validators 数组，每一个元素是一个检查器
     * {
     *  name: 'object.name.path',
     *  validator: true: required, regex: match, array: inside, function: return boolean
     *  message: 匹配失败的时候显示的错误文本
     * }
     * @param notify: 如果为 true，会自动显示 message
     * @returns {Promise.<T>}: 如果返回 === true，即为通过，否则返回 message
     */
    validate (notify = true) {
      const vm = this
      if (!(vm.validators instanceof Array)) return Promise.resolve()
      return Promise.all(vm.validators.map(item => new Promise((resolve, reject) => {
        let value = vm.getProperty(item.name)
        if (value === null || typeof value === 'undefined') value = ''
        if (item.validator === true) {
          // required 必填/必须有值
          return value ? resolve() : reject(item.message)
        } else if (item.validator instanceof RegExp) {
          // 必须满足正则
          return item.validator.test(value) ? resolve() : reject(item.message)
        } else if (item.validator instanceof Array) {
          // 在列表中存在
          return item.validator.indexOf(value) > -1 ? resolve() : reject(item.message)
        } else if (item.validator instanceof Function) {
          // 满足函数的调用
          const result = item.validator.apply(vm, [value])
          if ((typeof result.then) === 'function') {
            return result.then(
              () => resolve(),
              () => reject(item.message)
            )
          }
          return result ? resolve() : reject(item.message)
        }
        return reject(new Error())
      }))).catch(message => {
        if (notify) vm.notify(message)
      })
    },
    /**
     * 返回区划号码的一个前缀
     * @param district
     * @param length
     */
    areaPrefix (district, length = 6) {
      return Number((`${district.toString().substr(0, length)}000000`).substr(0, 6))
    },
    getDistrict (adcode = 86) {
      return this.$root.areaData[adcode] || []
    },
    getDistrictFullNameByCode (zipCode) {
      const vm = this
      return zipCode ? `${vm.getDistrictNameByCode(vm.areaPrefix(zipCode, 2))} ` +
        `${vm.getDistrictNameByCode(vm.areaPrefix(zipCode, 4))} ` +
        `${vm.getDistrictNameByCode(zipCode)}` : ''
    },
    getDistrictNameByCode (adcode) {
      const data = this.$root.areaData
      const parentCode = this.getDistrictParentCode(adcode)
      return parentCode && data[parentCode][adcode]
    },
    getDistrictShortNameByCode (adcode) {
      return this.getDistrictNameByCode(adcode)
        .replace(/(?:满族|蒙古族|回族)/g, '')
        .replace(/(?:省|市|自治区|区|自治县|县|联合旗|前旗|中旗|后旗|旗)$/, '')
    },
    getDistrictParentCode (adcode) {
      if (adcode % 10000 === 0) return 86
      if (adcode % 100 === 0) return adcode - adcode % 10000
      return adcode - adcode % 100
    },
    getChoiceText (choice, value, fieldText = 'text', fieldValue = 'value') {
      const vm = this
      const obj = choice.filter(
        opt => (vm.getProperty(opt, fieldValue) || '').toString() === (value || '').toString()
      )[0]
      return obj ? vm.getProperty(obj, fieldText) : null
    },
    /**
     * 执行一个函数，简单可以理解为返回 self[keyStr](value)
     * 如果 keyStr 为空，上面的调用中用 self 直接替代 self[keyStr]
     * 如果 self[keyStr] 或者 self 不是一个函数，直接返回之
     * 在 self[keyStr] 这个函数里面，this 指向当前 vm 实例
     * @param self
     * @param item
     * @param keyStr
     * @returns {*}
     */
    evaluate (self, item, keyStr) {
      const vm = this
      if (keyStr && typeof keyStr !== 'string') {
        console.warn('evaluate 指定的 field 无效，应为一个字符串')
        return vm.evaluate(self, '', item)
      }
      const obj = keyStr ? vm.getProperty(self, keyStr) : self
      // TODO: 存在缺陷待调试
      // return obj instanceof Function ? obj.apply(vm, [item]) : obj
      return obj instanceof Function ? obj(item) : obj
    },
    getContext (key) {
      const $root = this.$root
      return $root.context[key]
    },
    setContext (key, value) {
      const $root = this.$root
      $root.$set($root.context, key, value)
    },
    /**
     * 在当前的组件树里面搜索到 name 等于指定值的组件
     * @param name String
     * @param multiple Boolean
     */
    getVmByName (name, multiple = false) {
      const result = []
      const queue = [this.$root || window.app]
      while (queue.length) {
        const vm = queue.shift()
        if (vm.$options.name === name) {
          if (!multiple) return vm
          result.push(vm)
        }
        vm.$children.forEach(child => queue.push(child))
      }
      return multiple ? result : null
    },
    echo (obj) {
      console.log(obj)
    },
    waitFor (obj, prop, timeout = 5000) {
      const vm = this
      let timedOut = false
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          timedOut = true
          reject(new Error())
        }, timeout)
        const func = () => {
          if (vm.getProperty(obj, prop)) resolve()
          if (!timedOut) setTimeout(func, 200)
        }
        func()
      })
    },
    checkPermission (permission) {
      if (!window.cordova.plugins.permissions) {
        return Promise.reject(new Error('非Cordova环境，没有权限'))
      }
      const plugin = window.cordova.plugins.permissions
      return new Promise((resolve, reject) => {
        plugin.checkPermission(permission, status => {
          return status.hasPermission ? resolve() : reject(new Error('没有权限'))
        }, () => {
          reject(new Error('没有权限'))
        })
      })
    },
    requestPermission (permission) {
      if (!window.cordova.plugins.permissions) {
        return Promise.reject(new Error('非Cordova环境，没有权限'))
      }
      const plugin = window.cordova.plugins.permissions
      return new Promise((resolve, reject) => {
        const method = (permission instanceof Array) ? plugin.requestPermissions : plugin.requestPermission
        method(permission, status => {
          return status.hasPermission ? resolve() : reject(new Error('没有权限'))
        }, () => {
          reject(new Error('没有权限'))
        })
      })
    },
    ensurePermission (permission) {
      const vm = this
      return new Promise((resolve, reject) => {
        vm.checkPermission(permission).then(() => {
          resolve()
        }, () => {
          vm.requestPermission(permission).then(() => {
            resolve()
          }, () => {
            reject(new Error('权限获取失败'))
          })
        })
      })
    }
    // pickDate (date = dateformat(new Date(), 'yyyy-mm-dd')) {
    //   const vm = this.$root || window.app
    //   // 在 cordova 环境直接返回 promise
    //   // if (vm.$cordova && window.datePicker) {
    //   //   return new Promise((resolve, reject) => {
    //   //     window.datePicker.show({
    //   //       date: new Date(),
    //   //       mode: 'date',
    //   //     }, value => {
    //   //       const dt = new Date(value)
    //   //       resolve(dateformat(dt, 'yyyy-mm-dd'))
    //   //     }, error => {
    //   //       reject(error)
    //   //     })
    //   //   })
    //   // }
    //   // 否则走弹窗 deferred
    //   const deferred = new Deferred()
    //   vm.datepicker = { date, deferred }
    //   vm.$nextTick(() => {
    //     vm.$refs.datepicker.showCheck()
    //   })
    //   return deferred.promise
    // },
    // pickDateAction (success = true) {
    //   const vm = this.$root || window.app
    //   const deferred = vm.datepicker.deferred
    //   const date = vm.datepicker.date
    //   vm.datepicker.deferred = null
    //   return deferred[success ? 'resolve' : 'reject'](date)
    // },
  }
}
