var walkSync = require('walk-sync')
var fs = require('fs')

var os = require('os')
var HappyPack = require('happypack')
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

var getEntrys = function (path) {
    var files = walkSync(path, { globs: ['**/**/index.js'] })
    var res = {}, key
    files.forEach(function (cur) {
      var temp = cur.split('/')
      key = temp[0]
      if (temp[2]) key += '_' + temp[1]
      res[key] = path + '/' + cur
    })
    return res
}

var setPageUrl = function (json) {
    var temp = []
    var jsonKeyArr = Object.keys(json)
    jsonKeyArr.forEach(function (cur) {
        var jsonVal = json[cur]
        temp.push(`export const ${cur} = '${jsonVal}';\n`)
    })
    var str = temp.join(' ')
    fs.writeFile('./src/conf/pageUrl.conf.js', str, 'utf8', (err) => {
        if (err) throw err;
        console.log('pageUrl saved!');
    })
}

var createHappyPlugin = function (id, loaders) {
    return new HappyPack({
      id: id,
      loaders: loaders,
      threadPool: happyThreadPool,
      verbose: process.env.HAPPY_VERBOSE === '1'
    })
}

module.exports = {
    getEntrys: getEntrys,
    setPageUrl: setPageUrl,
    createHappyPlugin: createHappyPlugin
}
