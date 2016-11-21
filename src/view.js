const html = require('choo/html')
const insertCss = require('insert-css')
const style = require('typestyle').style
const debounce = require('lodash/debounce')

insertCss(`html, body { height: 100%; }`)

module.exports = function View (state, prev, send) {
  return html`
    <main class=${classes.container}>
      <textarea
        class=${classes.textarea}
        oninput=${debounce(oninput, 300)}
        placeholder="Type your note here">${state.contents}</textarea>

      <div class="container">
        ${StatusIndicator(state.filename)}
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

  function oninput (evt) {
    const value = evt.target.value
    const lines = value.split('\n')
    if (lines.length > 1) { // multiple lines
      send('save', value)
    }
  }

  function onClickFilename (evt) {
    send('openExternal', state.filename)
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
