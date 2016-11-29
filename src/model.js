const fs = require('fs')
const shell = require('electron').shell
const dialog = require('electron').remote.dialog
const path = require('path')
const slugify = require('slugify')
const series = require('run-series')
const settings = require('electron-settings')

module.exports = {
  state: {
    contents: '',
    filename: '',
    directory: './drafts/'
  },
  reducers: {
    setFilename: (filename, state) => ({ filename }),
    setContents: (contents, state) => ({ contents }),
    setDirectory: (directory, state) => ({ directory }),
    reset: (data, state) => ({ contents: '', filename: '' })
  },
  effects: {
    save: (data, state, send, done) => {
      const { contents, isNew } = data
      const ops = [
        (cb) => send('setContents', contents, cb),
        (cb) => send('writeFile', contents, cb)
      ]
      // If new file, the 2nd operation should be to name it
      if (isNew) {
        ops.splice(1, 0, (cb) => send('nameFile', contents, cb))
      }
      series(ops, done)
    },
    nameFile: (contents, state, send, done) => {
      const lines = contents.split('\n')
      const slug = slugify(lines[0])
      findAvailableFilename(state.directory, slug, '', (err, filename) => {
        if (err) return done(err)
        send('setFilename', filename, done)
      })
    },
    writeFile: (contents, state, send, done) => {
      const filePath = path.join(state.directory, state.filename) + '.md'
      console.log('writing', filePath)
      fs.writeFile(filePath, contents, done)
    },
    openExternal: (data, state, send, done) => {
      const filePath = path.join(state.directory, state.filename) + '.md'
      shell.openItem(filePath)
      done()
    },
    openDialog: (data, state, send, done) => {
      dialog.showOpenDialog({
        defaultPath: state.directory,
        properties: [ 'openDirectory', 'createDirectory' ]
      }, function (filePaths) {
        if (!filePaths) return done() // filePaths is undefined if user cancelled

        const newDirectory = filePaths[0]
        const operations = [
          (cb) => send('saveDirectory', newDirectory, cb)
        ]

        // If file is already written, also recreate it in new directory
        if (state.filename) {
          const payload = { contents: state.contents, isNew: true }
          operations.push((cb) => send('save', payload, cb))
        }

        // Run operations sequentially
        series(operations, done)
      })
    },
    saveDirectory: (directory, state, send, done) => {
      settings.set('directory', directory).then(() => {
        send('setDirectory', directory, done)
      }).catch(done)
    }
  },
  subscriptions: {
    getDirectory: (send, done) => {
      settings.get('directory').then((directory) => {
        if (!directory) return done()
        send('setDirectory', directory, done)
      }).catch(done)
    }
  }
}

function findAvailableFilename (directory, slug, suffix, callback) {
  const filename = slug + (suffix ? `-${suffix}` : '')
  const filePath = path.join(directory, filename) + '.md'

  fs.open(filePath, 'r', (err, fd) => {
    if (err) { // filename available
      console.log(`${filename} is available!`)
      callback(null, filename)
    } else { // filename taken. close it and recurse.
      console.log(`${filename} is not available. Recursing.`)
      fs.close(fd, (err) => {
        if (err) callback(new Error(`Error closing file ${filePath}`))
        const nextSuffix = suffix ? suffix + 1 : 1
        findAvailableFilename(directory, slug, nextSuffix, callback)
      })
    }
  })
}
