const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const source = path.join(__dirname, '..', 'source')
const rootPath = path.join(__dirname, '..')
const opts = { cwd: source }
const { git } = require('../config')

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

let clone = () => {
    console.log('git clone into => ' + source)
    exec('git clone ' + git.url + ' "' + source + '"' , {cwd: rootPath}, (e, so) => {
        console.log('clone finished')
    })
}

let pull = () => {
    exec('git pull')
}

let status = () => {
    exec('git status', opts, (e, so) => {
        console.log(/nothing to commit/.test(so))
    })
}

// clone()

status()


module.exports = {
    push: () => {
        if (!fs.existsSync(path.join(source, '.git'))) {
            exec('git init', opts, (e, so, se) => {
                push()
            })
        } else {
            push()
        }
    },
    pull: () => {
        if (!fs.existsSync(path.join(source, '.git'))) {
            clone()
        } else {
            push()
        }
    }
}
