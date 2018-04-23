const fs = require('fs')
const path = require('path')

class Render {
    constructor() {
        this.destPath = ''
    }
    copyFile(targetDir, destDir) {
        // TODO: here
        // fs.readdirSync
    }
    render(file, data) {
        let html = fs.readFileSync(file, { encoding: 'utf-8' })
        Object.keys(data).forEach((key) => {
            html = html.replace('{{' + key + '}}', data[key])
        })
        return html
    }
}

module.exports = new Render()