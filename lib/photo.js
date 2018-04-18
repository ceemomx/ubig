const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const images = require("images");

class Photo {
    constructor() {
        this.sourceDir = ''
    }
    source(dir) {
        this.sourceDir = dir
    }
    makeThumb(name) {
        return name.split('.')[0] + '_thumb.' + name.split('.')[1]
    }
    file(req, cb) {
        let form = new formidable.IncomingForm(),
            fields = {},
            files = []
        form.on('field', (name, value) => {
            fields[name] = value
        }).on('file', (name, file) => {
            files.push(file)
        }).on('end', () => {
            console.log(fields)
            files.forEach((file) => {
                let destPath = path.join(this.sourceDir, file.name)
                let photoFile = images(file.path)
                let width = photoFile.width(),
                    height = photoFile.height(),
                    limitHeight = 400,
                    limitWidth = 400,
                    thumbWidth = 200
                if (height >= width) {
                    if (height > 700)
                        photoFile.resize((width * (limitHeight / height)), limitHeight)
                } else {
                    if (width > 700)
                        photoFile.resize(limitWidth, (height * (limitWidth / width)))
                }
                photoFile.save(path.join(this.sourceDir, file.name), { quality: 80 })
                photoFile.resize(thumbWidth)
                photoFile.save(path.join(this.sourceDir, this.makeThumb(file.name)), { quality: 80 })
                fs.unlinkSync(file.path)
            })
            cb()
        })
        form.parse(req)
    }
}

module.exports = new Photo()