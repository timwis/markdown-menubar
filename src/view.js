const html = require('choo/html')
const insertCss = require('insert-css')
const style = require('typestyle').style
const debounce = require('lodash/debounce')
const truncateMiddle = require('truncate-middle')
const slugify = require('slugify')

insertCss(`html, body { height: 100%; }`)

module.exports = function View (state, prev, send) {
  return html`
    <main class=${classes.container}>
      <textarea
        class=${classes.textarea}
        oninput=${debounce(oninput, 300)}
        placeholder="Type your note here">${state.contents}</textarea>

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

  function oninput (evt) {
    const contents = evt.target.value
    if (contents.includes('\n')) { // multiple lines
      if (state.filename) { // file already exists
        send('writeFile', contents)
      } else { // new file
        send('createFile', contents)
      }
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
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }),
  textarea: style({
    width: '100%',
    height: '349px',
    marginBottom: 0
  }),
  status: style({
    fontSize: '80%',
    color: '#333'
  })
}
