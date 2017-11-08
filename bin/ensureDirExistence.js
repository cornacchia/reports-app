const fs = require('fs')

module.exports = function ensureDirExistence (path) {
  if (!fs.existsSync(path)){
    fs.mkdirSync(path)
}
}
