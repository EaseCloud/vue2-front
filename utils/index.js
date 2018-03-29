import dateFormat from 'dateformat'

export default {
  dateFormat,
  today (format = 'yyyy-mm-dd') {
    return dateFormat(new Date(), format)
  },
  yesterday (format = 'yyyy-mm-dd') {
    return dateFormat(new Date() - 24 * 3600 * 1000, format)
  },
  trim (str) {
    return str.replace(/^\s+|\s+$/g, '')
  },
  toCamel (str) {
    return str.replace(
      /([-_][a-z])/g,
      $1 => $1.toUpperCase().substr(1)
    ).replace(/^[a-z]/)
  },
  toDash (str) {
    return str.replace(
      /([A-Z])/g,
      $1 => `-${$1.toLowerCase()}`
    ).replace(/^-/, '')
  },
  toUnderscore (str) {
    return str.replace(
      /([A-Z])/g,
      $1 => `_${$1.toLowerCase()}`
    ).replace(/^_/, '')
  }
}
