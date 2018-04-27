const fs = require('fs')
const path = require('path')
let base = ''
var note = []

module.exports = {
    generate(cb) {
        fs.readdir(path.join(base, 'albums'), (err, years) => {
            years.forEach((year) => {
                let months = fs.readdirSync(path.join(base, 'albums', year))
                months.forEach((month) => {
                    let gallys = fs.readdirSync(path.join(base, 'albums', year, month))
                    gallys.forEach((gally) => {
                        let gallyInfo = JSON.parse(fs.readFileSync(path.join(base, 'albums', year, month, gally, 'info.json'), { encoding: 'utf8' }))
                        note.push(gallyInfo)
                    })
                })
            })
            var content = 'window.note = {};window.note.timeline = ' + JSON.stringify(note)
            fs.writeFileSync(path.join(base, 'note.js'), content)
            if (cb) cb()
        })
    },
    setBaseDir(dir) {
        base = path.join(dir)
    }
}
