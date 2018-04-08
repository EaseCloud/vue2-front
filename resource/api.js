import axios from 'axios'
// import config from '../../config/config'
import * as utils from './utils'

function parseArguments (args) {
  const result = {
    params: {},
    data: {}
  }
  if (args.length === 1) {
    result.params = args[0]
  } else if (args.length === 2) {
    result.params = args[0]
    result.data = args[1]
  }
  return result
}

function getFormDataFromDict (data) {
  if (data instanceof FormData) return data
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    formData.append(key, data[key])
  })
  return formData
}

function wrapPathWithParams (model, params, apiRoot) {
  let path = utils.getModelUrlFull(model, apiRoot)
  while (true) {
    const m = path.match(/\{\/([^}]*)}/)
    if (!m) return path
    path = path.replace(m[0], params[m[1]] ? '/' + params[m[1]] : '')
  }
}

if (localStorage.getItem('authorization')) {
  axios.defaults.headers.common['Authorization'] =
    localStorage.getItem('authorization')
}

const http = axios.create({
  // baseURL: config.api_root,
  timeout: 10000,
  withCredentials: true
  // headers: {'X-Custom-Header': 'foobar'}
})

// TODO: 这里的第二个参数尚未调通，原因是 data() 方法的时机 vm 尚未加载完全
export default function resource (model, apiRoot) {
  const safeMethod = method => {
    function func () {
      const { params, data } = parseArguments(arguments)
      return http.request({
        url: wrapPathWithParams(model, params, apiRoot),
        method,
        params: data
      })
    }

    return func
  }
  const unsafeMethod = method => {
    function func () {
      const { params, data } = parseArguments(arguments)
      return http.request({
        url: wrapPathWithParams(model, params, apiRoot),
        method,
        data: getFormDataFromDict(data)
      })
    }

    return func
  }
  return {
    get: safeMethod('get'),
    post: unsafeMethod('post'),
    save: unsafeMethod('post'),
    delete: safeMethod('delete'),
    head: safeMethod('head'),
    options: safeMethod('options'),
    put: unsafeMethod('put'),
    update: unsafeMethod('put'),
    patch: unsafeMethod('patch'),
    partialUpdate: unsafeMethod('patch'),
    setAuthorization (token) {
      localStorage.setItem('authorization', `Bearer ${token}`)
      axios.defaults.headers.common['Authorization'] =
        localStorage.getItem('authorization')
    }
  }
}
