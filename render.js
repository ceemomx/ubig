const path = require('path')
const r = require('./lib/render')

r.setData({title: 'hello world'})
r.copyFile(path.join('template', 'default'), path.join('source'))