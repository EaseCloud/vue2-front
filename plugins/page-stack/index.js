import uuid from 'uuid'

import PageStack from './PageStack.vue'

export default {
  install (Vue, opts) {
    const locationWatcherForPageStack = e => {
      window.app.loadLocationPath(true)
    }
    window.addEventListener('hashchange', locationWatcherForPageStack, true)
    // 注册 mixin 工具方法
    Vue.mixin({
      components: { PageStack },
      computed: {
        vmPageStack () {
          return this.$root.$refs.page_stack || window.app.$refs.page_stack
        },
        pageStack () {
          return this.$root.pages || window.app.pages
        },
        pageParent () {
          return this.$parent.$children[this.$parent.$children.indexOf(this) - 1]
        }
      },
      props: {
        pageParams: Object
      },
      methods: {
        getPageComponentName (page) {
          const vm = this
          const components = vm.config.components
          return Object.keys(components).filter(key => components[key] === page.component)[0]
        },
        saveLocationPath (silent) {
          const vm = this
          const path = vm.pageStack.map(item => {
            let result = vm.getPageComponentName(item)
            item.params = item.params || {}
            let params = Object.keys(item.params).map(key => `${key}=${item.params[key]}`).join()
            if (params) result += `(${params})`
            return result
          }).join('/')
          console.log(`>>>>> [SAVE PAGE STACK] #!/${path}`)
          if (silent) window.removeEventListener('hashchange', locationWatcherForPageStack, true)
          location.href = '#!/' + path
          if (silent) {
            setTimeout(() => {
              window.addEventListener('hashchange', locationWatcherForPageStack, true)
            }, 1000)
          }
        },
        loadLocationPath (keepStack) {
          console.log(`>>>>> [LOAD PAGE STACK] ${location.hash}`)
          const vm = this
          const components = location.hash.replace(/^(#!\/|#!|#)/, '').split('/')
          if (keepStack) {
            vm.pageStack.splice(
              components.length, vm.pageStack.length - components.length)
          } else {
            vm.pageClear()
          }
          let index = -1
          components.forEach(statement => {
            const parsedData = /^([^)]+)(?:\(([^)]+)\))?$/.exec(statement)
            const componentName = parsedData && parsedData[1]
            const params = {}
            if (parsedData && parsedData[2]) {
              parsedData[2].split(',').forEach(param => {
                const parsedParam = /^([^=]+)=(.*)$/.exec(param)
                params[parsedParam[1]] = parsedParam[2]
              })
            }
            index += 1
            if (vm.pageStack[index] &&
              vm.getPageComponentName(vm.pageStack[index]) === componentName) return
            vm.pagePush({
              key: uuid(),
              component: vm.config.components[componentName] ||
              vm.config.default_component || vm.config.components.Index,
              params
            }, true, index)
          })
          vm.saveLocationPath(true)
        },
        pageReplace (page) {
          const vm = this
          vm.pagePop()
          vm.$nextTick(() => {
            vm.pagePush(page)
          })
        },
        pagePush (page, silent, index = -1) {
          const vm = this
          // Supports component name entirely as a page
          if (typeof page === 'string') {
            return vm.pagePush({ component: vm.config.components[page] }, silent, index)
          }
          // Supports name specification
          if (typeof page.component === 'string') {
            page.component = vm.config.components[page.component]
          }
          page.key = uuid()
          console.log(`>>>>> [PAGE IN] ${vm.getPageComponentName(page)}#!/${page.key}`, page)
          vm.pageStack.splice(index < 0 ? vm.pageStack.length : index, 1, page)
          if (!silent) {
            vm.saveLocationPath(true)
          }
        },
        pagePop (silent) {
          const vm = this
          const page = vm.pageStack[vm.pageStack.length - 1]
          console.log(`<<<<< [PAGE OUT] ${vm.getPageComponentName(page)}#!/${page.key}`, page)
          vm.pageStack.pop()
          if (!silent) {
            vm.saveLocationPath(true)
          }
        },
        pageClear () {
          const vm = this
          vm.pageStack.splice(0, vm.pageStack.length - 1)
        }
      }
    })
  }
}
