const fs = require('fs')
const shell = require('electron').shell

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
      // First set the contents in the state, regardless of write success
      send('setContents', contents, () => {
        const filePath = `./drafts/${state.filename}.md`
        fs.writeFile(filePath, contents, (err) => {
          if (err) return done(new Error('Error writing file'))
          console.log('saved')
          done()
        })
      })
    },
    openExternal: (filePath, state, send, done) => {
      shell.openItem(filePath)
      done()
    }
  }
}
