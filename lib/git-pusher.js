const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const source = path.join(__dirname, '..', 'source')
const opts = { cwd: source }
const { git } = require('../config')

module.exports = () => {
    let push = () => {
        exec('git add -A', opts, (e, so, se) => {
            console.log(so)
            exec('git commit -m ' + git.message, opts, (e, so, se) => {
                console.log(so)
                exec('git push -u ' + git.url + ' HEAD:' + git.branch + ' --force', opts, (e, so, se) => {
                    console.log(so)
                })
            })
        })
    }
    
    if (!fs.existsSync(path.join(source, '.git'))) {
        exec('git init', opts, (e, so, se) => {
            push()
        })
    } else {
        push()
    }
}
