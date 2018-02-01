/** Converts a full date to dayily hours */

module.exports = function hourToString (d) {
  const date = new Date(d)
  return date.getHours() + ':' +
    date.getMinutes() + ':' +
    date.getSeconds()
}
