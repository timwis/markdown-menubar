const choo = require('choo')

const app = choo()

app.model(require('./model'))

app.router((route) => [
  route('/', require('./view'))
])

const tree = app.start()
document.body.appendChild(tree)
