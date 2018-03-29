<template>

  <div id="app">
    <page-stack ref="page_stack" :pages="pages"></page-stack>
    <div class="block-loading" v-if="(loading.counter > 0) && loading.show">
      <loading :loading="loading.counter > 0"
               :color="loading.color"></loading>
    </div>
  </div>

</template>

<script type="text/babel">
  import config from '../../config/config'

  // Root component
  export default {
    name: 'vue2-front',
    data () {
      return {
        // 页面是否已经初始化（加载完用户信息）
        initialized: false,
        current_user: config.current_user || null,
        context: {},
        loading: {
          counter: 0,
          color: '#545F71',
          size: 64,
          show: true
        },
        datepicker: null,
        pages: []
      }
    },
    mounted () {
      // 将根 VM 共享到全局变量
      const vm = window.app = this
      // [config] on_root_mounted
      const promiseRootMounted = vm.config.on_root_mounted
        ? vm.config.on_root_mounted.apply(vm) : Promise.resolve()
      promiseRootMounted.then(() => {
        // call Bootstrap script
        config.bootstrap.apply(window.app)
      })
    },
    methods: {}
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import (once) "../../assets/css/defines";

  .block-loading {
    z-index: 1000;
    .fill-fixed();
    .v-spinner {
      .block-center-fixed();
    }
  }
</style>
