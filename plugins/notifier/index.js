import Deferred from 'es6-deferred'
import NotifierRegistry from './NotifierRegistry.vue'
import areaData from 'china-area-data'
import uuid from 'uuid'

export default {
  install (Vue, opts) {
    let $notifier

    // 注册 NotifierRegistry 组件
    const el = document.createElement('div')
    document.body.appendChild(el)

    // 注册 mixin 工具方法
    Vue.mixin({
      // components: { NotifierRegistry },
      computed: {
        $notifier: () => $notifier
      },
      methods: {
        notify (content, title = '系统消息', options = {}) {
          const DEFAULTS = {
            type: 'info',
            duration: 3000
          }
          const item = Object.assign({ title, content }, options, DEFAULTS)
          item.key = parseInt(Math.random() * 1000000)
          console.log(`notify: ${content}`)
          $notifier.notifications.push(item)
          setTimeout(() => {
            $notifier.dismissNotify(item)
            // $notifier.notifications.shift(item)
          }, item.duration)
        },
        dismissNotify (notification) {
          $notifier.notifications.splice($notifier.notifications.indexOf(notification), 1)
        },
        clearDialogs () {
          $notifier.dialogs.forEach(item => {
            $notifier.dialogAction(item, false)
          })
          if ($notifier.imagePicker.deferred) {
            $notifier.pickImageAction(false)
          }
        },
        confirm (content, title = '') {
          const deferred = new Deferred()
          $notifier.dialogs.push({
            key: uuid(),
            type: 'confirm',
            title,
            content,
            deferred
          })
          console.log(`confirm: ${title && title + ': '} ${content}`)
          return deferred.promise
        },
        prompt (content = '', title = '', value = '', placeholder = '') {
          const deferred = new Deferred()
          $notifier.dialogs.push({
            key: uuid(),
            type: 'prompt',
            title,
            content,
            deferred,
            placeholder,
            value
          })
          return deferred.promise
        },
        /**
         * 归一化选项：[{text: 'xxx', value: 'xxx'}, ...]
         * 支持的输入格式：
         * 1. 对象： {value1: text1, value2: text2, ...}
         * 2. 字符串数组：[item1, item2, ...]，这样的话 text 和 value 都是 item 值
         * 3. 直接对象数组（无需处理）
         * @param choices
         * @returns {*}
         */
        normalizeChoices (choices, defaultValue = null) {
          if (Array.isArray(choices)) {
            if (!choices.length) return choices
            return choices.map((item, i) => {
              let result
              if (typeof item === 'string') {
                result = {
                  text: item,
                  value: item
                }
              } else if (typeof item === 'object' &&
                item.hasOwnProperty('text') && item.hasOwnProperty('value')) {
                result = Object.assign({}, item)
              } else {
                console.warn('pickChoice 选项格式错误：', item)
                result = { text: '<未知的选项>', value: null }
              }
              result.selected = result.value !== null && result.value === defaultValue
              return result
            })
          } else if (typeof (choices) === 'object') {
            return Object.keys(choices).map(
              value => ({
                value,
                text: choices[value],
                selected: value !== null && value === defaultValue
              })
            )
          }
          console.warn('pickChoice 选项组格式错误：', choices)
          return choices
        },
        pickChoice (choices = [], defaultValue = '', title = '') {
          const deferred = new Deferred()
          $notifier.dialogs.push({
            key: uuid(),
            type: 'choice',
            title,
            deferred,
            choices: this.normalizeChoices(choices)
          })
          return deferred.promise
        },
        pickDistrict (val = '') {
          const value = val || ''
          return $notifier.pickChoice(areaData[86], `${$notifier.areaPrefix(value, 2)}`)
            .then(province => $notifier.pickChoice(areaData[province], `${$notifier.areaPrefix(value, 4)}`))
            .then(city => $notifier.pickChoice(areaData[city], $notifier.areaPrefix(value)))
        },
        dialogAction (dialog, success = true, value = null) {
          const index = $notifier.dialogs.indexOf(dialog)
          if (index === -1) return Promise.reject(new Error('对话框不存在', dialog))
          $notifier.dialogs.splice(index, 1)
          return dialog.deferred[success ? 'resolve' : 'reject'](value)
        },
        /**
         * 调起拾取照片的 thenable
         * @param size
         * @param defaultSourceType 0-指定相册选择,1-手机拍照
         * @returns {global.Promise}
         */
        pickImage (size = 1080, type = 'normal', defaultSourceType = false) {
          const deferred = new Deferred()
          $notifier.imagePicker.size = size
          $notifier.imagePicker.deferred = deferred

          // if (navigator.camera && !/Android [45]/.test(window.navigator.userAgent)) {
          if (navigator.camera) {
            const chooseSourceType = defaultSourceType === false
              ? $notifier.pickChoice([
                { text: '從相冊選擇', value: 0 },
                { text: '拍照上傳', value: 1 }
              ])
              : Promise.resolve(defaultSourceType)
            chooseSourceType.then(sourceType => {
              // 多图拾取，尚未调通
              //
              // if (window.imagePicker && sourceType === 0) {
              //   window.imagePicker.getPictures(
              //     results => {
              //       if (!results.length) deferred.reject('没有选择图片')
              //       alert(results[0]);//eslint-disable-line
              //       deferred.resolve(results[0])
              //     },
              //     error => {
              //       deferred.reject(error)
              //     }
              //   )
              //   return deferred.promise
              // }
              let options
              if (type === 'icon') {
                options = { // options
                  destinationType: 0, // 0:DATAURL(base64), 1:FILE_URI, 2:NATIVE_URI
                  allowEdit: true,
                  // saveToPhotoAlbum: true,
                  correctOrientation: true,
                  sourceType, // 0:PHOTOLIBRARY, 1:CAMERA, 2: SAVEDPHOTOALBUM
                  targetWidth: 600,
                  targetHeight: 600
                }
              } else if (type === 'square') {
                options = { // options
                  destinationType: 0, // 0:DATAURL(base64), 1:FILE_URI, 2:NATIVE_URI
                  allowEdit: true,
                  // saveToPhotoAlbum: true,
                  correctOrientation: true,
                  sourceType, // 0:PHOTOLIBRARY, 1:CAMERA, 2: SAVEDPHOTOALBUM
                  targetWidth: 599,
                  targetHeight: 600
                }
              } else {
                options = { // options
                  destinationType: 0, // 0:DATAURL(base64), 1:FILE_URI, 2:NATIVE_URI
                  allowEdit: true,
                  // saveToPhotoAlbum: true,
                  correctOrientation: true,
                  sourceType // 0:PHOTOLIBRARY, 1:CAMERA, 2: SAVEDPHOTOALBUM
                }
              }
              navigator.camera.getPicture(imageURI => { // on success
                  // console.log(imageURI)
                  $notifier.imagePicker.image_uri = `data:image/jpeg;base64,${imageURI}`
                  $notifier.pickImageAction()
                  $notifier.resetStatusBar()
                }, message => { // on fail
                  console.log(message)
                  $notifier.notify(`获取图片失败：${message}`)
                  $notifier.resetStatusBar()
                }, options
              )
            })
            // } else if (window.CameraPreview && /Android/.test(window.navigator.userAgent)) {
            //   const chooseSourceType = defaultSourceType === false
            //     ? vm.pickChoice([
            //       { text: '從相冊選擇', value: 0 },
            //       { text: '拍照上傳', value: 1 },
            //     ])
            //     : Promise.resolve(defaultSourceType)
            //   chooseSourceType.then(sourceType => {
            //     if (sourceType === 1) {
            //       const options = {
            //         x: 0,
            //         y: 0,
            //         width: window.screen.width,
            //         height: window.screen.height,
            //         camera: window.CameraPreview.CAMERA_DIRECTION.BACK,
            //         toBack: false,
            //         tapPhoto: true,
            //         tapFocus: false,
            //         previewDrag: false
            //       }
            //       window.CameraPreview.startCamera(options)
            //       window.CameraPreview.takePicture({ // options
            //         width: 640, height: 640, quality: 85
            //       }, imageURI => { // on success
            //         console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
            //         console.log(imageURI)
            //         $notifier.imagePicker.image_uri = `data:image/jpeg;base64,${imageURI}`
            //         $notifier.pickImageAction()
            //         vm.resetStatusBar()
            //       }, message => { // on fail
            //         console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
            //         console.log(message)
            //         $notifier.notify(`获取图片失败：${message}`)
            //         $notifier.resetStatusBar()
            //       })
            //     }
            //   })
          } else { // normal browser
            $notifier.$refs.imageUploader.click()
          }
          return deferred.promise
        }
      }
    })

    // render the NotifierRegistry component
    const NotifierRegistryApp = Vue.extend(NotifierRegistry)
    $notifier = new NotifierRegistryApp({ el })
  }
}
