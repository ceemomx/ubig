const fs = require('fs')
const path = require('path')

class Router {
    constructor() {
        this.routers = { get: {}, post: {}, params: {} }
        this.staticDir = ''
    }
    setStatic(dir) {
        this.staticDir = dir
    }
    callbackHandler(cb) {
        return (req, res) => {
            res.json = (json) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(json));
            }
            res.render = (file) => {
                if (!fs.existsSync(file)) {
                    this.notFound(res)
                } else {
                    fs.createReadStream(file).pipe(res)
                }
            }
            cb(req, res)
        }
    }
    requestHandler(req) {
        let matchedUrl = []
        let reqUrl = req.url.split('/')
        let match_url = (url) => {
            let matched = 0
            url.split('/').forEach((param, index) => {
                if (param === reqUrl[index])
                    matched++
            })
            return matched
        }
        Object.keys(this.routers.params).forEach((url) => {
            if (url.split('/').length === reqUrl.length) {
                matchedUrl.push(url)
            }
        })
        if (matchedUrl.length) {
            matchedUrl.sort((a, b) => {
                return match_url(b) - match_url(a)
            })
            req.params = {}
            matchedUrl[0].split('/').forEach((param, index) => {
                if (param !== reqUrl[index])
                    req.params[param.replace(':', '')] = decodeURI(reqUrl[index])
            })
            req.url = matchedUrl[0]
        }
        if (/\?/.test(req.url)) {
            req.query = {}
            req.url.split('?')[1].split('&').forEach((query) => {
                req.query[query.split('=')[0]] = decodeURI(query.split('=')[1])
            })
            req.url = req.url.split('?')[0]
        }
        return req
    }
    get(url, cb) {
        if (/:/.test(url)) {
            this.routers.params[url] = url.split('/').length
        }
        this.routers.get[url] = this.callbackHandler(cb)
    }
    post(url, cb) {
        this.routers.post[url] = this.callbackHandler(cb)
    }
    notFound(res) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.write('Not Found')
        res.end()
    }
    staticFile(req, res) {
        if (fs.existsSync(path.join(this.staticDir, req.url))) {
            if (fs.statSync(path.join(this.staticDir, req.url)).isDirectory()) {
                req.url += req.url === '/' ? 'index.html' : '/index.html'
            }
            if (!fs.existsSync(path.join(this.staticDir, req.url))) {
                this.notFound(res)
            } else {
                fs.createReadStream(path.join(this.staticDir, req.url)).pipe(res)
            }

        } else {
            this.notFound(res)
        }
    }
    router() {
        return (req, res) => {
            req = this.requestHandler(req)
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