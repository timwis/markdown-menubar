const fs = require('fs')

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
    save: (data, state, send, done) => {
      // First set the contents in the state, regardless of write success
      send('setContents', data, () => {
        const filePath = `./drafts/${state.filename}.md`
        fs.writeFile(filePath, data, (err) => {
          if (err) return done(new Error('Error writing file'))
          console.log('saved')
          done()
        })
      })
    }
  }
}
