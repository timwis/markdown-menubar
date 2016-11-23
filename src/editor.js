const html = require('choo/html')
const insertCss = require('insert-css')
const debounce = require('lodash/debounce')
const widget = require('cache-element/widget')
const CodeMirror = require('codemirror')
require('codemirror/mode/markdown/markdown')
require('codemirror/mode/gfm/gfm')
require('codemirror/addon/edit/continuelist')

insertCss(`.CodeMirror { flex: 1 auto; }`)

module.exports = widget((handleUpdates) => {
  let changeCallback

  const tree = html`
    <div>
      <textarea
        placeholder="Type your note here"
        onload=${onload}></textarea>
    </div>
  `

  function onload () {
    const textarea = tree.querySelector('textarea')
    console.log('loaded', textarea)
    const editor = CodeMirror.fromTextArea(textarea, {
      mode: 'gfm',
      autofocus: true,
      extraKeys: { 'Enter': 'newlineAndIndentContinueMarkdownList' }
    })

    editor.on('change', debounce((instance, change) => {
      if (changeCallback) {
        const value = editor.getValue()
        changeCallback(value)
      }
    }, 300))
  }

  // Called on construction & at every state update
  handleUpdates((contents, style, newChangeCallback) => {
    // editor.value = contents
    tree.classList.add(style)
    changeCallback = newChangeCallback
  })

  return tree
})
