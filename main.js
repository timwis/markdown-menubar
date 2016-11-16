const menubar = require('menubar')

const mb = menubar()

mb.on('after-create-window', () => {
  if (process.env.NODE_ENV === 'development') mb.window.openDevTools()
})
