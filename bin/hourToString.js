/** Converts a full date to dayily hours */

module.exports = function hourToString (d) {
  console.log(d)
  const date = new Date(d)
  return date.getHours() + ':' +
    date.getMinutes() + ':' +
    date.getSeconds()
}
