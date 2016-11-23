const choo = require('choo')

const app = choo()

if (process.env.NODE_ENV === 'development') {
  app.use(require('choo-log')())
}

app.model(require('./model'))

app.router((route) => [
  route('/', require('./view'))
])

const tree = app.start()
document.body.appendChild(tree)
