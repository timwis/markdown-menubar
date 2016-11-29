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
  let changeCallback, editor

  const tree = html`
    <div>
      <textarea
        placeholder="Type your note here"
        onload=${onload}></textarea>
    </div>
  `

  function onload () {
    const textarea = tree.querySelector('textarea')
    editor = CodeMirror.fromTextArea(textarea, {
      mode: 'gfm',
      autofocus: true,
      extraKeys: { 'Enter': 'newlineAndIndentContinueMarkdownList' },
      lineWrapping: true
    })

    editor.on('change', debounce((instance, change) => {
      // setValue is called below. This filter avoids an infinite loop.
      if (changeCallback && change.origin !== 'setValue') {
        const value = editor.getValue()
        changeCallback(value)
      }
    }, 300))
  }

  // Called on construction & at every state update
  handleUpdates((contents, style, newChangeCallback) => {
    // Only change the contents on a reset
    if (editor && contents === '') {
      editor.setValue(contents)
    }
    tree.classList.add(style)
    changeCallback = newChangeCallback
  })

  return tree
})
