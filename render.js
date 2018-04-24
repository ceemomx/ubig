const path = require('path')
const r = require('./lib/render')
const config = require('./config')

r.setData(config)
r.copyFile(path.join('template', config.template), path.join('source'))