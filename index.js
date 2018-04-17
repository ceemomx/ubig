const http = require('http');
const path = require('path');
const staticDir = path.join(__dirname, 'public');
let router = require('./lib/router')

router.setStatic(staticDir);

router.get('/info', (req, res) => {
    res.end('555')
})

http.createServer(router.router()).listen(4000);