module.exports = function dateToString(d) {
  const date = new Date(d)

  return date.getFullYear() + '-' +
    (date.getMonth() + 1) + '-' +
    date.getDate()
}
