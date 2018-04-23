const path = require('path')
const r = require('./lib/render')

console.log(r.render(path.join('template', 'default', 'index.html'), {title: 'hello ubig me'}))