const http = require('http')
const fs = require('fs')
const path = require('path')
const staticDir = path.join(__dirname, 'public')
const formidable = require('formidable')
let router = require('./lib/router')

router.setStatic(staticDir)

router.get('/info', (req, res) => {
    res.end('555')
})

router.post('/admin/up/photos', (req, res) => {
    let form = new formidable.IncomingForm();
    form.on('file', function(name, file) {
        fs.copyFileSync(file.path, path.join(__dirname,'source', file.name))
        fs.unlinkSync(file.path)
    })
    form.on('end', function() {
        res.end('parse end')
    });

})

http.createServer(router.router()).listen(4000)