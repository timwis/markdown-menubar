const menubar = require('menubar')

const opts = {}
const DEV = process.env.NODE_ENV === 'development'
if (DEV) opts.alwaysOnTop = true

const mb = menubar(opts)

mb.on('after-create-window', () => {
  if (DEV) mb.window.openDevTools()
})
