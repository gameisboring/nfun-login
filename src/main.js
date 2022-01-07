const express = require('express')
const router = express.Router()
const app = express()
const port = 3000

app.set('views', 'src/views')
app.set('view engine', 'ejs')

app.use(express.static('src/public'))

app.use('/', router)

router.get('/', (req, res) => {
  res.render('register', { title: '제목이 들어갈 자리' })
})

router.post('/register', async (req, res) => {
  // const { name, password, email } = req.body
  if (!req.body) {
    console.log('입력받은 값 없음')
    res.status(500)
    res.send('fail')
    return
  }
  console.log(req.body.DATA)
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
