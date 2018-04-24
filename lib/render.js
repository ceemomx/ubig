const fs = require('fs')
const path = require('path')

class Render {
    constructor() {
        this.destPath = ''
        this.data = {}
    }
    setData(data) {
        this.data = data
    }
    copyFile(targetDir, destDir) {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir)
        }
        let files = fs.readdirSync(targetDir)
        files.forEach((file) => {
            if (fs.lstatSync(path.join(targetDir, file)).isDirectory()) {
                this.copyFile(path.join(targetDir, file), path.join(destDir, file))
            } else {
                if (file.split('.')[1] === 'html') {
                    fs.writeFileSync(path.join(destDir, file), this.render(path.join(targetDir, file)), { encoding: 'utf-8' })
                } else {
                    fs.copyFileSync(path.join(targetDir, file), path.join(destDir, file))
                }
            }
        })
    }
    deepKey(obj, cb, deep) {
        Object.keys(obj).forEach((key) => {
            let _key = key
            if (deep) _key = deep + '.' + key
            if (typeof obj[key] === 'object') {
                this.deepKey(obj[key], cb, _key)
            } else {
               cb(_key, obj[key])
            }
        })
    }
    render(file) {
        let html = fs.readFileSync(file, { encoding: 'utf-8' })
        this.deepKey(this.data, (key, val) => {
            html = html.replace('{{' + key + '}}', val)
        })
        return html
    }
}

module.exports = new Render()