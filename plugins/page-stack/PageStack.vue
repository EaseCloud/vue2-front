<template>

  <transition-group name="page-transition" mode="out-in" tag="div"
                    class="page-stack">
    <component v-for="page in pages"
               :key="page.key"
               :is="page.component"
               :page-params="page.params"></component>
  </transition-group>

</template>

<script lang="babel">
  export default {
    props: {
      pages: Array
    }
  }
</script>

<style rel="stylesheet/less" lang="less">
  @import (once) "../../assets/css/less-template/template-defines";

  .page {
    .fill-absolute();
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 0;
  }

  .page-transition-enter-active, .page-transition-leave-active {
    .transition-duration(0.5s);
  }

  .page-transition-enter, .page-transition-leave-to {
    left: 100%;
    right: -100%;
    opacity: 0;
  }
</style>
