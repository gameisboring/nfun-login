require('dotenv').config()

const express = require('express')
var path = require('path')
const router = express.Router()
const app = express()
const port = process.env.PORT
const pageTitle = process.env.PAGE_TITLE
const { createHashedPassword, makePasswordHashed } = require('./lib/pw')

const bodyParser = require('body-parser')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', 'src/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use('/', router)

var connection = require('./lib/db')

router.get('/', function (req, res, next) {
  connection.query(`SELECT ADMIN_START FROM NFUN_ADMIN;`, (err, selRes) => {
    if (err) console.log(err)

    const startDate = selRes[0].ADMIN_START.toLocaleString()
    const nowDate = new Date().toLocaleString()
    console.log(`현재시간 : ${nowDate}`)
    console.log(`시작시간 : ${startDate}`)
    if (nowDate > startDate) {
      res.render('login2', { title: process.env.MAINPAGE_TITLE })
    } else {
      res.render('register', {
        title: process.env.MAINPAGE_TITLE,
        header: '사전등록',
      })
    }
  })
})

router.get('/admin', function (req, res, next) {
  res.render('home2', { title: process.env.ADMINPAGE_TITLE })
})
router.get('/admin/book', function (req, res, next) {
  connection.query(
    'SELECT * FROM NFUN_BOOK ORDER BY BOOK_TIME;',
    async (err, selRes) => {
      if (err) {
        console.log(err)
      }
      if (selRes.length > 0) {
        selRes.ok = true
        res.json(selRes)
      }
    }
  )
})

router.get('/home', function (req, res, next) {
  res.render('home', { title: process.env.MAINPAGE_TITLE })
})

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: process.env.MAINPAGE_TITLE,
    header: '참가신청',
  })
})

router.post('/register', async (req, res, next) => {
  const { name, password, email, belong } = req.body
  if (!req.body) {
    console.log(req.body)
    res.status(500)
    res.send('fail')
    return
  }

  connection.query(
    `SELECT * FROM NFUN_BOOK WHERE BOOK_EMAIL = ? && book_name = ?;`,
    [email, name],
    async (err, selRes) => {
      const _selRes = selRes[0] ? selRes[0] : null
      if (err) {
        console.log(err)
        res.json({ ok: false })
        return
      }
      if (_selRes != null) {
        console.log('중복!')
        res.json({ ok: false })
        return
      }

      const { hashedPassword, salt } = await createHashedPassword(password)
      connection.query(
        'INSERT INTO NFUN_BOOK(BOOK_NAME,BOOK_BELONG,BOOK_TIME,BOOK_EMAIL,BOOK_PASSWORD,BOOK_SALT)VALUES(?,?,sysdate(),?,?,?);',
        [name, belong, email, hashedPassword, salt],
        (err, selRes) => {
          if (err) {
            console.log(err)
            res.json({ ok: false })
            return
          }
          res.json({ ok: true })
        }
      )
    }
  )
})

router.get('/login', function (req, res, next) {
  res.render('login', { title: process.env.LOGINPAGE_TITLE })
})

router.post('/login', async (req, res, next) => {
  // 요청 body 변수 할당
  const { email, password } = req.body
  // 입력받은 email과 password로 salt 적용시킨 hashedPassword 받아옴
  const hashedPassword = await makePasswordHashed(email, password)
  if (email && hashedPassword) {
    console.log(`email : ${email} | password : ${password}`)
    connection.query(
      'SELECT * FROM NFUN_BOOK WHERE BOOK_EMAIL = ? && BOOK_PASSWORD = ?',
      [email, hashedPassword],
      (err, selRes) => {
        if (selRes.length > 0) {
          if (selRes[0].BOOK_ROLE === 'ADMIN') {
            res.json({ ok: 'ADMIN' })
            return
          }
          res.json({ ok: true })
        } else {
          res.json({ ok: false })
        }
      }
    )
  } else {
    res.json({ ok: false })
  }
})

app.listen(port, () => {
  console.log(`nstream web server listening at http://localhost:${port}`)
})
