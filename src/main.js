const express = require('express')
const router = express.Router()
const app = express()
const port = 3000

const bodyParser = require('body-parser')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views', 'src/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use('/', router)

var connection = require('./lib/db')

router.get('/', function (req, res, next) {
  res.render('register', { title: '제목이 들어갈 자리' })
})

router.post('/register', function (req, res, next) {
  const { name, password, email } = req.body
  if (!req.body) {
    console.log('입력받은 값 없음')
    console.log(req.body)
    res.status(500)
    res.send('fail')
    return
  }

  connection.query('INSERT INTO BOOK()')

  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
