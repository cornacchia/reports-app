/** Check if a directory specified by a path exists, otherwise create it */

const fs = require('fs')

module.exports = function ensureDirExistence (path) {
  if (!fs.existsSync(path)){
    fs.mkdirSync(path)
}
}
