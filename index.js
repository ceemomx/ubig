const http = require('http')
const fs = require('fs')
const path = require('path')
const staticDir = path.join(__dirname, 'public')
const sourceDir = path.join(__dirname, 'source')
let router = require('./lib/router')
let photo = require('./lib/photo')

router.setStatic(staticDir)
photo.source(sourceDir)

router.get('/info', (req, res) => {
    res.end('555')
})

router.post('/admin/up/photos', (req, res) => {
    photo.file(req, () => {
        res.end('parse end')
    })
})

http.createServer(router.router()).listen(4000)