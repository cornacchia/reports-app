module.exports = {

  // Format date YYYY/MM/DD
  formatDate: function (date) {
    return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate()
  },

  // Format time duration
  formatHours: function (date) {
    let result = ''
    const hours = date.getHours()
    const minutes = date.getMinutes()
    let hoursText = ' ore'

    if (hours === 1) {
      hoursText = ' ora'
    }
    result += hours + hoursText
    if (minutes > 0) {
      let minutesText = ' minuti'
      if (minutes === 1) {
        minutesText = ' minuto'
      }
      result += ' e ' + minutes + minutesText
    }

    return result
  }
}