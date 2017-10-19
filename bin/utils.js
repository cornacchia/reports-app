module.exports = {
  formatDate: function (date) {
    return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate()
  },

  formatHours: function (date) {
    var result = ''
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var hoursText = ' ore'
    if (hours === 1) {
      hoursText = ' ora'
    }
    result += hours + hoursText
    if (minutes > 0) {
      var minutesText = ' minuti'
      if (minutes === 1) {
        minutesText = ' minuto'
      }
      result += ' e ' + minutes + minutesText
    }

    return result
  }
}