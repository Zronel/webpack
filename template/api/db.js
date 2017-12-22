const fs = require('fs')
const path = require('path')

let db = {}

module.exports = function(){
  let files = scanDir(path.join(__dirname, "./data"))
  //获取文件列表
  files.forEach((file) => {
    //构建数据库
    db[path.basename(file).split('.')[0]] = require(file)
  })
  // 监听文件变化
  files.forEach((file) => {
    fs.watch(file, () => {
      // 清除require中对应缓存，以获取文件最新内容
      delete require.cache[path.resolve(file)]
      try {
        //更新数据库中对应数据
        db[path.basename(file).split('.')[0]] = require(file)
      } catch(e) {
        //文件正在修改时可能存在语法错误，不能正常require，此时不予处理
      }

    })
  })
  return db
}

/**
 * 遍历文件夹
 * @param dir
 * @returns {Array}
 */
function scanDir(dir){
  let files = []
  scan(dir)
  function scan(_dir){
    if (fs.statSync(_dir).isFile() && _dir.indexOf('.DS_Store') < 0) {
      return files.push(_dir)
    }
    fs.statSync(_dir).isDirectory()&&
    fs.readdirSync(_dir).forEach((file) => {
      scan(_dir + '/' + file)
    })
  }
  return files
}
