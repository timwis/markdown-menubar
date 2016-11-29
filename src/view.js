const html = require('choo/html')
const insertCss = require('insert-css')
const style = require('typestyle').style
const truncateMiddle = require('truncate-middle')

const Editor = require('./editor')

insertCss(`html, body { height: 100%; }`)

module.exports = function View (state, prev, send) {
  return html`
    <main class=${classes.container}>
      ${Editor(state.contents, classes.editor, onchange)}

      <div class="container">
        <div class="u-pull-left">
          ${StatusIndicator(state.filename)}
          ${DirectoryIndicator(state.directory)}
        </div>
        <button class="u-pull-right" onclick=${reset}>New</button>
      </div>
    </main>
  `

  function StatusIndicator (filename) {
    return filename ? html`
      <span class=${classes.status}>
        Saved as
        <a href="#" onclick=${onClickFilename}>
          ${state.filename}.md
        </a>
      </span>
    ` : html`
      <span class=${classes.status}>
        Not saved
      </span>
    `
  }

  function DirectoryIndicator (directory) {
    return html`
      <div class=${classes.status}>
        in
        <a href="#" onclick=${onClickDirectory}>
          ${truncateMiddle(directory, 10, 15, '…')}
        </a>
      </div>
    `
  }

  function onchange (contents) {
    if (contents.includes('\n')) { // multiple lines
      // If there's no filename, mark it as a new file
      const payload = { contents, isNew: !state.filename }
      send('save', payload)
    }
  }

  function onClickFilename (evt) {
    send('openExternal')
    evt.preventDefault()
    evt.stopPropagation()
  }

  function onClickDirectory (evt) {
    send('openDialog')
    evt.preventDefault()
    evt.stopPropagation()
  }

  function reset (evt) {
    send('reset')
  }
}

const classes = {
  container: style({
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }),
  editor: style({
    flex: '1 auto',
    display: 'flex',
    flexDirection: 'column'
  }),
  status: style({
    fontSize: '80%',
    color: '#333'
  })
}
