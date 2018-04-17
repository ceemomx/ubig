const fs = require('fs')
const path = require('path')

class Router {
    constructor() {
        this.routers = { get: {}, post: {} }
        this.staticDir = ''
    }
    setStatic(dir) {
        this.staticDir = dir
    }
    get(url, cb) {
        this.routers.get[url] = cb
    }
    post(url, cb) {
        this.routers.post[url] = cb
    }
    staticFile(req, res) {
        req.url = req.url === '/' ? 'index.html' : req.url
        let exist = fs.existsSync(path.join(this.staticDir, req.url))
        if (exist) {
            fs.createReadStream(path.join(this.staticDir, req.url)).pipe(res)
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.write('Not Found')
            res.end()
        }
    }
    router() {
        return (req, res) => {
            if (req.method === 'GET') {
                if (this.routers.get[req.url]) {
                    this.routers.get[req.url](req, res)
                } else {
                    this.staticFile(req, res)
                }
            } else {
                this.routers.post[req.url](req, res)
            }

        }

    }
}

module.exports = new Router()