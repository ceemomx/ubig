const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const source = path.join(__dirname, '..', 'source')
const rootPath = path.join(__dirname, '..')
const opts = { cwd: source }
const { git } = require('../config')


let clone = () => {
    console.log('git clone into => ' + source)
    exec('git clone ' + git.url + ' "' + source + '"' , {cwd: rootPath}, (e, so) => {
        console.log('clone finished')
    })
}


let init = (cb) => {
    exec('git init', opts, (e, so, se) => {
        cb(e)
    })
}

let commit = (cb) => {
    exec('git add -A', opts, (e, so, se) => {
        console.log(so)
        exec('git commit -m ' + git.message, opts, (e, so, se) => {
            console.log(so)
            cb(e)
        })
    })
}

let status = (cb) => {
    exec('git status', opts, (e, so) => {
        cb(!/nothing to commit/.test(so))
    })
}


let push = () => {
    commit((err) => {
        exec('git push -u ' + git.url + ' HEAD:' + git.branch + ' --force', opts, (e, so, se) => {
            console.log(so)
            console.log('git push finished')
        })
    })
}

let pull = () => {
    console.log('pull files from git')
    let _pull = () => {
        exec('git pull', opts, () => {
            console.log('git pull finished')
        })
    }
    status((changed) => {
        if (changed) {
            console.log('local file changed')
            commit((err) => {
                console.log('commit files before pull')
               _pull()
            })
        } else {
            _pull()
        }
    })
}

module.exports = {
    push: () => {
        if (!fs.existsSync(path.join(source, '.git'))) {
            init((err) => {
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
            pull()
        }
    }
}
