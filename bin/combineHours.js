/** Converts numeric values for hours and minutes in today's date and time */

module.exports = function (hours, minutes) {
  let result = new Date()
  result.setHours(parseInt(hours) - 1)
  result.setMinutes(parseInt(minutes) - 1)
  return result
}
