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
    photo.file(req, (info) => {
        res.json(info)
    })
})

router.get('/admin/photos', (req, res) => {
    photo.list((list) => {
        res.json(list)
    })
})

router.get('/admin/album', (req, res) => {
    res.render(path.join(staticDir, '/admin/album.html'))
})

router.get('/photos/:year/:month/:title/:image', (req, res) => {
    res.render(path.join('source', 'images', req.params.year, req.params.month, req.params.title, req.params.image))
})

router.get('/admin/photo/:year/:month/:title', (req, res) => {
    let albumPath = path.join(req.params.year, req.params.month, req.params.title)
    photo.album(albumPath, (err, info) => {
        if (err) {
            router.notFound(res)
        } else {
            res.json(info)
        }
    })
})

router.get('/admin/photo/remove/:year/:month/:title/:image', (req, res) => {
    let albumPath = path.join(req.params.year, req.params.month, req.params.title, req.params.image)
    photo.removePhoto(albumPath, req.params, (data) => {
        res.json(data)
    })
})

router.post('/admin/edit/album', (req, res) => {
    photo.editAlbum(req, (info) => {
        res.json(info)
    })
})

router.get('/admin/album/remove/:year/:month/:title', (req, res) => {
    let albumPath = path.join(req.params.year, req.params.month, req.params.title)
    photo.removeAlbum(albumPath, req.params, (err, info) => {
        if (err) {
            router.notFound(res)
        } else {
            res.json(info)
        }
    })
})


http.createServer(router.router()).listen(4000)