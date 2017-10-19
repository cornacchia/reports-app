module.exports = function (hours, minutes) {
  var result = new Date()
  result.setHours(parseInt(hours) - 1)
  result.setMinutes(parseInt(minutes) - 1)
  return result
}
