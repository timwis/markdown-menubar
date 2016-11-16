const html = require('bel')
const insertCss = require('insert-css')
const debounce = require('lodash/debounce')
const fs = require('fs')

const FILENAME = './notes.md'

insertCss(`html, body { height: 100%; }`)

const View = (contents) => {
  return html`
    <main class="absolute absolute--fill">
      <textarea
        class="w-100 h-100"
        oninput=${debounce(oninput, 300)}>${contents}</textarea>
    </main>
  `

  function oninput (evt) {
    console.log(evt.target.value)
    fs.writeFile(FILENAME, evt.target.value, (err) => {
      if (err) return console.error('Error writing file')
      console.log('saved')
    })
  }
}

fs.readFile(FILENAME, 'utf-8', (err, contents) => {
  if (err) return console.error('Error reading file')
  console.log(contents)
  document.body.appendChild(View(contents))
})
