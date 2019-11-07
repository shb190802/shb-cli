const fse = require('fs-extra')

function getDirFiles(dir) {
  try {
    let files = fse.readFileSync(dir)
  }catch(e){
    return []
  }
}