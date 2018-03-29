<template>

  <div class="notifiers">

    <div class="block-image-picker block-invisible">
      <input type="file" accept="image/*"
             style="width: 1px; height: 1px; position: absolute; z-index: -1; opacity: 0"
             @change="pickImageAction()"
             ref="imageUploader"/>
    </div>

    <transition-group tag="div" class="dialogs" name="fade">
      <div class="block-dialog"
           :class="{last: i+1===dialogs.length}"
           v-for="(dialog, i) in dialogs"
           :key="dialog.key"
           @click="dialogAction(dialog, false)">
        <!-- confirm -->
        <div v-if="dialog.type === 'confirm'"
             class="modal-dialog modal-dialog-confirm"
             @click.stop>
          <div class="modal-header" v-if="dialog.title">
            <a class="btn-close" @click="dialogAction(dialog, false)">&times;</a>
            <h4 class="modal-title">{{dialog.title}}</h4>
          </div>
          <div class="modal-body">
            {{dialog.content}}
          </div>
          <div class="modal-footer">
            <a @click="dialogAction(dialog, true)"
               type="button" class="btn btn-confirm">确定
            </a>
            <a @click="dialogAction(dialog, false)"
               type="button" class="btn btn-cancel">取消
            </a>
          </div>
        </div>
        <!-- prompt -->
        <div v-else-if="dialog.type === 'prompt'"
             class="modal-dialog modal-dialog-prompt"
             @click.stop>
          <div class="modal-header">
            <a class="btn-close" @click="dialogAction(dialog, false)">&times;</a>
            <h4 class="modal-title">{{dialog.title}}</h4>
          </div>
          <div class="modal-body">
            <div class="prompt-content" v-if="dialog.content">{{dialog.content}}</div>
            <input class="prompt-input" type="text"
                   :placeholder="dialog.placeholder" ref="promptInput"
                   title v-model="dialog.value"/>
          </div>
          <div class="modal-footer">
            <a @click="dialogAction(dialog, true, dialog.value)"
               href="javascript:"
               type="button" class="btn btn-confirm">确定
            </a>
            <a @click="dialogAction(dialog, false)"
               href="javascript:"
               type="button" class="btn btn-cancel">取消
            </a>
          </div>
        </div>
        <!-- choices -->
        <div v-else-if="dialog.type === 'choice'"
             class="modal-dialog modal-dialog-choice"
             @click.stop>
          <div class="modal-header">
            <a class="btn-close" @click="dialogAction(dialog, false)">&times;</a>
            <h4 class="modal-title">{{dialog.title}}</h4>
          </div>
          <div class="modal-body">
            <ul class="list-choices">
              <li class="item-choice"
                  :key="item.value"
                  v-for="item in dialog.choices">
                <a :class="{active: item.selected}"
                   @click.stop="dialogAction(dialog, true, item.value)">{{item.text}}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition-group>

    <transition-group tag="div" class="block-notify" name="fade">
      <div class="row"
           :key="notification.key"
           v-show="index >= notifications.length - 5"
           v-for="(notification, index) in notifications">
        <div class="item-notify">{{ notification.content }}</div>
      </div>
    </transition-group>

  </div>

</template>

<script lang="babel" type="text/babel">
  import lrz from 'lrz'

  export default {
//    components: { datepicker },
    mounted () {
      window.$notifier = this
    },
    data () {
      return {
        dialogs: [],
        notifications: [],
        imagePicker: {
          size: 1080,
          image_uri: null,
          deferred: null
        }
      }
    },
    methods: {
      pickImageAction () {
        const vm = this
        const formdata = new FormData()
        const deferred = vm.imagePicker.deferred
        vm.imagePicker.deferred = null
        const files = vm.$refs.imageUploader.files
//        console.log(files)
        const imageURI = vm.imagePicker.image_uri || files.length && files[0]
        console.log(imageURI)
        vm.imagePicker.image_uri = null
        if (!imageURI) {
          return deferred.reject('尚未选择图片文件')
        }
        if (/base64/.test(imageURI)) {
          formdata.append('image', imageURI)
          return window.app.api('Image').save(formdata).then(
            resp => deferred.resolve(resp.data)
          )
        }
        vm.resetStatusBar()
        // 压缩并加入 formdata 上传
        return lrz(imageURI, {
          width: vm.imagePicker.size,
          height: vm.imagePicker.size
        }).then(rst => {
//          vm.notify('compress success')
          formdata.append('image', rst.file, rst.origin.name)
//          console.log('rst-------------------------------------------')
//          console.log(rst)
//          formdata.append('image', rst.file)
          // reset the form
          vm.$refs.imageUploader.value = ''
          // [config] image_model
//          console.log('---------------------------------------------')
//          console.log(formdata)
          const model = window.app.config.image_model || window.app.api('Image')
          return model.save(formdata).then(
            resp => deferred.resolve(resp.data)
          )
        }, err => {
          console.log(err)
        }).catch(err => {
          console.log(err)
        })
      }
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import (once) "../../assets/css/less-template/template-defines";

  .block-notify {
    position: fixed;
    left: 50%;
    width: 0;
    bottom: 1.8rem;
    overflow: visible;
    .row {
      width: 16rem;
      margin-left: -8rem;
      text-align: center;
      .item-notify {
        display: inline-block;
        margin: 0.2rem;
        max-width: 16rem;
        width: auto;
        font-size: 0.8rem;
        line-height: 1rem;
        padding: 0.3rem 0.5rem;
        .rounded-corners(0.8rem);
        background: rgba(0,0,0,0.5);
        color: white;
      }
    }
  }

  .block-dialog {
    z-index: 100;
    .fill-fixed();
    &.last {
      background: rgba(0, 0, 0, 0.4);
    }
  }

  .modal-dialog {
    color: #333333;
    background: white;
    font-size: 0.8rem;
    .fixed-bottom();
    .box-shadow(0 0 0.5rem rgba(0, 0, 0, 0.2));
    .modal-header {
      line-height: 2.4rem;
      border-bottom: 1px solid #ebebeb;
      padding: 0 0.8rem;
      position: relative;
      font-size: 0.9rem;
      .modal-title {
        display: inline-block;
      }
      .btn-close {
        position: absolute;
        .dock-right();
        width: 2.4rem;
        text-align: center;
        display: block;
        font-size: 1.5rem;
      }
    }
    .modal-body {
      padding: 0.8rem;
      line-height: 1.2rem;
    }
    .modal-footer {
      border-top: 1px solid #ebebeb;
      .clearfix();
      .btn {
        display: block;
        float: left;
        width: 50%;
        .border-box();
        font-size: 0.9rem;
        line-height: 2.2rem;
        text-align: center;
      }
      .btn-confirm {
        border-right: 1px solid #ebebeb;
      }
    }
    &.modal-dialog-prompt {
      .prompt-input {
        margin-top: 0.4rem;
        width: 100%;
        padding: 0.4rem;
        .border-box();
        background: rgba(0, 0, 0, 0.1);
      }
    }
    &.modal-dialog-choice {
      .modal-body {
        padding: 0;
      }
      ul.list-choices {
        line-height: 2rem;
        max-height: 2em * 8;
        overflow-y: auto;
        li.item-choice {
          a {
            display: block;
            padding: 0 0.8rem;
            &:active {
              background: #f5f5f5;
            }
            &.active {
              color: #3bbcf5;
            }
          }
        }
      }
    }
  }
</style>
