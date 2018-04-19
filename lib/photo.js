const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const images = require("images");

class Photo {
    constructor() {
        this.sourceDir = ''
        this.imageDir = ''
    }
    source(dir) {
        this.sourceDir = dir
        this.imageDir = path.join(dir, 'images')
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
            let destPath = path.join(this.sourceDir, 'images', fields.year, fields.month, fields.title)
            let info = {
                thumb: '',
                photos: [],
                year: fields.year,
                month: fields.month,
                position: JSON.parse(fields.position)
            }
            info.photos = JSON.parse(fields.album)
            if (!fs.existsSync(path.join(this.sourceDir, 'images', fields.year))) {
                fs.mkdirSync(path.join(this.sourceDir, 'images', fields.year))
            }
            if (!fs.existsSync(path.join(this.sourceDir, 'images', fields.year, fields.month))) {
                fs.mkdirSync(path.join(this.sourceDir, 'images', fields.year, fields.month))
            }
            if (!fs.existsSync(path.join(this.sourceDir, 'images', fields.year, fields.month, fields.title))) {
                fs.mkdirSync(path.join(this.sourceDir, 'images', fields.year, fields.month, fields.title))
            }

            files.forEach((file, index) => {

                let photoFile = images(file.path)
                let width = photoFile.width(),
                    height = photoFile.height(),
                    limitHeight = 2000,
                    limitWidth = 2000,
                    thumbWidth = 200
                if (height >= width) {
                    if (height > 2000)
                        photoFile.resize((width * (limitHeight / height)), limitHeight)
                } else {
                    if (width > 2000)
                        photoFile.resize(limitWidth, (height * (limitWidth / width)))
                }
                photoFile.save(path.join(destPath, file.name), { quality: 80 })
                photoFile.resize(thumbWidth)

                if ((fields.thumb === file.name) || (!fields.thumb && !index)) {
                    photoFile.save(path.join(destPath, this.makeThumb(file.name)), { quality: 80 })
                    info.thumb = this.makeThumb(file.name)
                }
                fs.unlinkSync(file.path)
            })
            fs.writeFileSync(path.join(destPath, 'info.json'), JSON.stringify(info), { encoding: 'utf8' })
            cb(info)
        })
        form.parse(req)
    }
    list(cb) {
        let album = []
        fs.readdir(path.join(this.imageDir), (err, years) => {
            years.forEach((year) => {
                let months = fs.readdirSync(path.join(this.imageDir, year))
                months.forEach((month) => {
                    let gallys = fs.readdirSync(path.join(this.imageDir, year, month))
                    gallys.forEach((gally) => {
                        let info = JSON.parse(fs.readFileSync(path.join(this.imageDir, year, month, gally, 'info.json'), { encoding: 'utf8' }))
                        album.push({
                            thumb: info.thumb,
                            year: year,
                            month: month,
                            title: gally
                        })
                    })
                })
            })
            cb(album)
        })
    }
    album(dir, cb) {
        let err = null,
            info = null
        if (fs.existsSync(path.join(this.imageDir, dir, 'info.json'))) {
            info = JSON.parse(fs.readFileSync(path.join(this.imageDir, dir, 'info.json'), { encoding: 'utf8' }))
        } else {
            err = 'info not found'
        }
        cb(err, info)
    }
    remove(dir, cb) {
        let err = null
        if (fs.existsSync(path.join(this.imageDir, dir, 'info.json'))) {
            let fileList = fs.readdirSync(path.join(this.imageDir, dir))
            fileList.forEach((file) => {
                fs.unlinkSync(path.join(this.imageDir, dir, file))
            })
            fs.rmdirSync(path.join(this.imageDir, dir))
        } else {
            err = 'info not found'
        }
        cb(err, { status: 200 })
    }
}

module.exports = new Photo()