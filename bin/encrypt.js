var scrypt = require('scryptsy')
var config = require('../config')

module.exports = function (password) {
  var cryptoPassword = scrypt(
    password,
    config.scrypt.salt,
    config.scrypt.N,
    config.scrypt.r,
    config.scrypt.p,
    config.scrypt.lenBytes
  ).toString('hex')

  return cryptoPassword
}
