const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const images = require("images")
const album = 'albums'

class Photo {
    constructor() {
        this.sourceDir = ''
        this.imageDir = ''
    }
    source(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }
        this.sourceDir = dir
        this.imageDir = path.join(dir, album)
    }
    cleanDir() {
        let years = fs.readdirSync(this.imageDir)
        if (years.length) {
            years.forEach((year) => {
                let months = fs.readdirSync(path.join(this.imageDir, year))
                if (!months.length) {
                    fs.rmdirSync(path.join(this.imageDir, year))
                } else {
                    months.forEach((month) => {
                        let gallys = fs.readdirSync(path.join(this.imageDir, year, month))
                        if (!gallys.length) {
                            fs.rmdirSync(path.join(this.imageDir, year, month))
                            this.cleanDir()
                        }
                    })
                }
            })
        } else {
            fs.rmdirSync(dir)
        }
    }
    saveFile(destPath, file) {
        let limitHeight = 2000,
            limitWidth = 2000,
            photoFile = images(file.path),
            width = photoFile.width(),
            height = photoFile.height()
        if (height >= width) {
            if (height > 2000)
                photoFile.resize((width * (limitHeight / height)), limitHeight)
        } else {
            if (width > 2000)
                photoFile.resize(limitWidth, (height * (limitWidth / width)))
        }
        photoFile.save(path.join(destPath, file.name), { quality: 100 })
        fs.unlinkSync(file.path)
    }
    generateThumb(destPath, target, cb) {
        let thumbWidth = 250
        if (fs.existsSync(path.join(destPath, target))) {
            let thumb = images(path.join(destPath, target))
            thumb.resize(thumbWidth)
            thumb.save(path.join(destPath, 'thumb.jpg'), { quality: 100 })
        }
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
            let destPath = path.join(this.imageDir, fields.year, fields.month, fields.title)
            let info = {
                thumb: '',
                photos: [],
                year: fields.year,
                month: fields.month,
                position: JSON.parse(fields.position),
                title: fields.title
            }
            info.photos = JSON.parse(fields.album)
            if (!fs.existsSync(path.join(this.imageDir, fields.year))) {
                fs.mkdirSync(path.join(this.imageDir, fields.year))
            }
            if (!fs.existsSync(path.join(this.imageDir, fields.year, fields.month))) {
                fs.mkdirSync(path.join(this.imageDir, fields.year, fields.month))
            }
            if (!fs.existsSync(path.join(this.imageDir, fields.year, fields.month, fields.title))) {
                fs.mkdirSync(path.join(this.imageDir, fields.year, fields.month, fields.title))
            }

            files.forEach((file, index) => {
                this.saveFile(destPath, file)
                if ((fields.thumb === file.name) || (!fields.thumb && !index)) {
                    info.thumb = file.name
                }
            })
            this.generateThumb(destPath, info.thumb)
            fs.writeFileSync(path.join(destPath, 'info.json'), JSON.stringify(info), { encoding: 'utf8' })
            cb(info)
        })
        form.parse(req)
    }
    editAlbum(req, cb) {
        let form = new formidable.IncomingForm(),
            fields = {},
            files = [],
            album = []
        form.on('field', (name, value) => {
            fields[name] = value
        }).on('file', (name, file) => {
            files.push(file)
        }).on('end', () => {
            fields.origin = JSON.parse(fields.origin)
            let destPath = path.join(this.imageDir, fields.year, fields.month, fields.title)
            let targetPath = path.join(this.imageDir, fields.origin.year, fields.origin.month, fields.origin.title)
            let info = JSON.parse(fs.readFileSync(path.join(targetPath, 'info.json'), { encoding: 'utf8' }))
            info.position = JSON.parse(fields.position)

            album = JSON.parse(fields.album) || []
            if (album.length) {
                album.forEach((photo) => {
                    info.photos.push(photo)
                })
            }
            if (files.length) {
                files.forEach((file) => {
                    this.saveFile(targetPath, file)
                })
            }
            info.thumb = fields.thumb
            this.generateThumb(targetPath, info.thumb)

            if (info.year !== fields.year) {
                if (!fs.existsSync(path.join(this.imageDir, fields.year))) {
                    fs.mkdirSync(path.join(this.imageDir, fields.year))
                }
                info.year = fields.year
            }
            if (info.month !== fields.month) {
                if (!fs.existsSync(path.join(this.imageDir, fields.year, fields.month))) {
                    fs.mkdirSync(path.join(this.imageDir, fields.year, fields.month))
                }
                info.month = fields.month
            }
            if (!(info.month === fields.origin.month && info.year === fields.origin.year && info.title === fields.title)) {

                if (fs.existsSync(destPath)) {
                    fields.title += '(1)'
                }
            }
            fs.renameSync(targetPath, path.join(this.imageDir, fields.year, fields.month, fields.title))
            info.title = fields.title
            fs.writeFileSync(path.join(this.imageDir, fields.year, fields.month, fields.title, 'info.json'), JSON.stringify(info), { encoding: 'utf8' })
            this.cleanDir()
            cb(info)
        })
        form.parse(req)
    }
    list(cb) {
        let album = []
        fs.readdir(path.join(this.imageDir), (err, years) => {
            if (years) {
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
                cb(null, album)
            } else {
                cb('not found')
            }
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
    removePhoto(dir, params, cb) {
        if (fs.existsSync(path.join(this.imageDir, dir))) {
            fs.unlinkSync(path.join(this.imageDir, dir))
            let info = JSON.parse(fs.readFileSync(path.join(this.imageDir, params.year, params.month, params.title, 'info.json'), { encoding: 'utf8' }))
            let photos = []
            if (info.thumb === params.image) {
                info.thumb = ''
            }
            info.photos.forEach((photo, index) => {
                if (!info.thumb && !index) {
                    info.thumb = photo.photo
                }
                if (photo.photo !== params.image) {
                    photos.push(photo)
                }
            })
            this.generateThumb(path.join(this.imageDir, params.year, params.month, params.title), info.thumb)
            info.photos = photos
            fs.writeFileSync(path.join(this.imageDir, params.year, params.month, params.title, 'info.json'), JSON.stringify(info), { encoding: 'utf8' })
        }
        cb({ status: 200 })
    }
    removeAlbum(dir, params, cb) {
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
        // this.cleanDir(path.join(this.imageDir, 'images', params.year))
        cb(err, { status: 200 })
    }
}

module.exports = new Photo()