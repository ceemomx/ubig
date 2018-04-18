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
        let form = new formidable.IncomingForm()
        form.on('file', (name, file) => {
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
        form.parse(req, (err, feilds) => {
            console.log(feilds)
        })
        form.on('end', cb)
    }
}

module.exports = new Photo()