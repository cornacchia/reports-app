module.exports = function hourToString (d) {
  const date = new Date(d)
  return date.getHours() + ':' +
    date.getMinutes() + ':' +
    date.getSeconds()
}
