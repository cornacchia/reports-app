/** Encrypts a string to a scrypt password */

const scrypt = require('scryptsy')
const config = require('../config')

module.exports = function (password) {
  const cryptoPassword = scrypt(
    password,
    config.scrypt.salt,
    config.scrypt.N,
    config.scrypt.r,
    config.scrypt.p,
    config.scrypt.lenBytes
  ).toString('hex')

  return cryptoPassword
}
