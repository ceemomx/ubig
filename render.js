const path = require('path')
const R = require('./lib/render')
const config = require('./config')
let render = new R()

render.setData(config)
render.copyFile(path.join('template', config.template), path.join('source'))