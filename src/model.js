const fs = require('fs')
const shell = require('electron').shell
const dialog = require('electron').remote.dialog
const path = require('path')
const slugify = require('slugify')
const series = require('run-series')

module.exports = {
  state: {
    contents: '',
    filename: '',
    directory: './drafts/'
  },
  reducers: {
    setFilename: (filename, state) => {
      console.log('setFilename', filename)
      return { filename }
    },
    setContents: (contents, state) => ({ contents }),
    setDirectory: (directory, state) => ({ directory }),
    reset: (data, state) => module.exports.state
  },
  effects: {
    createFile: (contents, state, send, done) => {
      send('nameFile', contents, (err) => {
        if (err) return done(err)
        send('writeFile', contents, done)
      })
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
      // First set the contents in the state, regardless of write success
      send('setContents', contents, () => {
        const filePath = path.join(state.directory, state.filename) + '.md'
        console.log('writing', filePath)
        fs.writeFile(filePath, contents, done)
      })
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
          (cb) => send('setDirectory', newDirectory, cb)
        ]

        // If file is already written, also recreate it in new directory
        if (state.filename) {
          operations.push((cb) => send('createFile', state.contents, cb))
        }

        // Run operations sequentially
        series(operations, done)
      })
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
