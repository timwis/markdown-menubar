const fs = require('fs')
const shell = require('electron').shell
const slugify = require('slugify')

const DIR = './drafts/'

module.exports = {
  state: {
    contents: '',
    filename: ''
  },
  reducers: {
    setFilename: (filename, state) => ({ filename }),
    setContents: (contents, state) => ({ contents }),
    reset: (data, state) => module.exports.state
  },
  effects: {
    save: (contents, state, send, done) => {
      if (state.filename) {
        const filename = state.filename
        send('writeFile', { contents, filename }, done)
      } else {
        send('nameFile', contents, (err, filename) => {
          if (err) return done(err)
          send('writeFile', { filename, contents }, done)
        })
      }
    },
    nameFile: (contents, state, send, done) => {
      const lines = contents.split('\n')
      const slug = slugify(lines[0])
      findAvailableFilename(DIR, slug, '', (err, filename) => {
        if (err) return done(err)
        send('setFilename', filename, done)
      })
    },
    writeFile: (data, state, send, done) => {
      const { filename, contents } = data
      // First set the contents in the state, regardless of write success
      send('setContents', contents, () => {
        const filePath = `${DIR}${filename}.md`
        fs.writeFile(filePath, contents, done)
      })
    },
    openExternal: (filename, state, send, done) => {
      const filePath = `${DIR}${filename}`
      shell.openItem(filePath)
      done()
    }
  }
}

function findAvailableFilename (path, slug, suffix, callback) {
  const filename = slug + (suffix ? `-${suffix}` : '')
  const filePath = `${path}${filename}.md`

  fs.open(filePath, 'r', (err, fd) => {
    if (err) { // filename available
      console.log(`${filename} is available!`)
      callback(null, filename)
    } else { // filename taken. close it and recurse.
      console.log(`${filename} is not available. Recursing.`)
      fs.close(fd, (err) => {
        if (err) callback(new Error(`Error closing file ${filePath}`))
        const nextSuffix = suffix ? suffix + 1 : 1
        callback(null, findAvailableFilename(path, slug, nextSuffix, callback))
      })
    }
  })
}
