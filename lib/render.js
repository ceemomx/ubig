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
                    fs.copyFileSync(path.join(targetDir,file), path.join(destDir, file))
                }
            }
        })
    }
    render(file) {
        let html = fs.readFileSync(file, { encoding: 'utf-8' })
        Object.keys(this.data).forEach((key) => {
            html = html.replace('{{' + key + '}}', this.data[key])
        })
        return html
    }
}

module.exports = new Render()