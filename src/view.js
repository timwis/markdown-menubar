const html = require('choo/html')
const insertCss = require('insert-css')
const style = require('typestyle').style
const debounce = require('lodash/debounce')
const slugify = require('slugify')

insertCss(`html, body { height: 100%; }`)

module.exports = function View (state, prev, send) {
  return html`
    <main class=${classes.container}>
      <textarea
        class=${classes.textarea}
        oninput=${debounce(oninput, 300)}>${state.contents}</textarea>
      ${state.filename
        ? html`<span>Saved as ${state.filename}.md</span>`
        : html`<span>Not saved</span>`}
      <button class="u-pull-right">New</button>
    </main>
  `

  function oninput (evt) {
    const value = evt.target.value
    const lines = value.split('\n')
    if (lines.length > 1) { // multiple lines
      if (!state.filename) {
        const filename = slugify(lines[0])
        send('setFilename', filename)
      }
      send('save', value)
    }
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
  })
}