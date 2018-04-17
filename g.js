const fs = require('fs')
const path = require('path')
const base = 'assets/images'
var note = []

fs.readdir(path.join(base), (err, years) => {
    years.forEach((year) => {
        let months = fs.readdirSync(path.join(base, year))
        months.forEach((month) => {
            let gallys = fs.readdirSync(path.join(base, year, month))
            gallys.forEach((gally) => {
                let photos = fs.readdirSync(path.join(base, year, month, gally))
                let photoPath = base + '/' + year + '/' + month + '/' + gally + '/'
                let gallyInfo = {
                    img: photoPath + photos[0],
                    text: gally.split('_')[0],
                    location: {x: +gally.split('_')[1], y: +gally.split('_')[2]},
                    year,
                    month,
                    gally: photos.map((photo) => {
                        return {src: photoPath + photo, note: photo.split('.')[0]}
                    })
                }
                note.push(gallyInfo)
            })
        })
    })
    var content = 'window.note = {};window.note.timeline = ' + JSON.stringify(note)
    fs.writeFile('note.js', content, (err, data) => {

    })
})
