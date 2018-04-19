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
    cleanDir(dir) {
        let children = fs.readdirSync(dir)
        if (children.length) {
            children.forEach((child) => {
                let last = fs.readdirSync(child)
                if (!last.length) {
                    fs.rmdirSync(path.join(dir, child))
                } 
            })
        } else {
            fs.rmdirSync(dir)
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
            let destPath = path.join(this.sourceDir, 'images', fields.year, fields.month, fields.title)
            let info = {
                thumb: '',
                photos: [],
                year: fields.year,
                month: fields.month,
                position: JSON.parse(fields.position),
                title: fields.title
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
    removePhoto(dir, params, cb) {
        if (fs.existsSync(path.join(this.imageDir, dir))) {
            fs.unlinkSync(path.join(this.imageDir, dir))
            let info = JSON.parse(fs.readFileSync(path.join(this.imageDir, params.year, params.month, params.title, 'info.json'), { encoding: 'utf8' }))
            let photos = []
            info.photos.forEach((photo) => {
                if (photo.photo !== params.image) {
                    photos.push(photo)
                }
            })
            info.photos = photos
            fs.writeFileSync(path.join(this.imageDir, params.year, params.month, params.title, 'info.json'), JSON.stringify(info), { encoding: 'utf8' })
        }
        cb({ status: 200 })
    }
    editAlbum(req, cb) {
        let form = new formidable.IncomingForm(),
            fields = {},
            files = [],
            album = [],
            limitHeight = 2000,
            limitWidth = 2000,
            thumbWidth = 200
        form.on('field', (name, value) => {
            fields[name] = value
        }).on('file', (name, file) => {
            files.push(file)
        }).on('end', () => {
            let destPath = path.join(this.sourceDir, 'images', fields.year, fields.month, fields.title)
            let info = JSON.parse(fs.readFileSync(path.join(this.imageDir, fields.year, fields.month, fields.title, 'info.json'), { encoding: 'utf8' }))
            info.position = JSON.parse(fields.position)

            album = JSON.parse(fields.album) || []
            if (album.length) {
                album.forEach((photo) => {
                    info.photos.push(photo)
                })
            }
            if (files.length) {
                files.forEach((file, index) => {
                    let photoFile = images(file.path)
                    let width = photoFile.width(),
                        height = photoFile.height()
                    if (height >= width) {
                        if (height > 2000)
                            photoFile.resize((width * (limitHeight / height)), limitHeight)
                    } else {
                        if (width > 2000)
                            photoFile.resize(limitWidth, (height * (limitWidth / width)))
                    }
                    photoFile.save(path.join(destPath, file.name), { quality: 80 })

                    if ((fields.thumb === file.name) || (!fields.thumb && !index)) {
                        photoFile.resize(thumbWidth)
                        photoFile.save(path.join(destPath, this.makeThumb(file.name)), { quality: 80 })
                        info.thumb = this.makeThumb(file.name)
                    }
                    fs.unlinkSync(file.path)
                })
            }
            console.log(info)
            console.log(fields)
            if (info.thumb !== fields.thumb) {
                let thumb = images(path.join(destPath, fields.thumb))
                thumb.resize(thumbWidth)
                thumb.save(path.join(destPath, this.makeThumb(fields.thumb)), { quality: 80 })
                info.thumb = this.makeThumb(fields.thumb)
                fs.unlinkSync(path.join(destPath, info.thumb))
            }

            if (info.year !== fields.year) {
                if (!fs.existsSync(path.join(this.sourceDir, 'images', fields.year))) {
                    fs.mkdirSync(path.join(this.sourceDir, 'images', fields.year))
                }
                info.year = fields.year
            }
            if (info.month !== fields.month) {
                if (!fs.existsSync(path.join(this.sourceDir, 'images', fields.year, fields.month))) {
                    fs.mkdirSync(path.join(this.sourceDir, 'images', fields.year, fields.month))
                }
                info.month = fields.month
            }

            if (info.title !== fields.title) {
                if (fs.existsSync(path.join(this.sourceDir, 'images', fields.year, fields.month, fields.title))) {
                    fields.title += '(1)'
                }
                fs.renameSync(path.join(this.sourceDir, 'images', fields.year, fields.month, info.title), path.join(this.sourceDir, 'images', fields.year, fields.month, fields.title))
                info.title = fields.title
                this.cleanDir(path.join(this.imageDir, 'images', fields.year))
            }
            fs.writeFileSync(path.join(destPath, 'info.json'), JSON.stringify(info), { encoding: 'utf8' })
            cb(info)
        })
        form.parse(req)
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