require('dotenv').config()

const express = require('express')
var path = require('path')
const router = express.Router()
const app = express()
const port = process.env.PORT
const util = require('util')
const crypto = require('crypto')

const sequelize = require('../models').sequelize
const bodyParser = require('body-parser')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('views', 'src/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')))
app.use('/', router)

const pbkdf2Promise = util.promisify(crypto.pbkdf2)

const createHashedPassword = async (password) => {
  const salt = await createSalt()
  const key = await pbkdf2Promise(password, salt, 104906, 64, 'sha512')
  const hashedPassword = key.toString('base64')
  console.log(`hashedPw : ${hashedPassword}`)

  return { hashedPassword, salt }
}

// salt 만들기
const createSalt = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) reject(err)
      resolve(buf.toString('base64'))
    })
  })

const makePasswordHashed = (email, plainPassword) =>
  new Promise(async (resolve, reject) => {
    // salt를 가져오는 부분은 각자의 DB에 따라 수정
    connection.query(
      'SELECT BOOK_SALT,BOOK_PASSWORD FROM NFUN_BOOK WHERE book_email = ?',
      [email],
      (err, res) => {
        if (err) {
          console.log(err)
          return
        }
        if (res.length > 0) {
          const salt = res[0].BOOK_SALT
          crypto.pbkdf2(
            plainPassword,
            salt,
            104906,
            64,
            'sha512',
            (err, key) => {
              if (err) reject(err)
              resolve(key.toString('base64'))
            }
          )
        } else {
          resolve(false)
        }
      }
    )
  })

// sequelize.sync()
var connection = require('./lib/db')
const res = require('express/lib/response')

router.get('/', function (req, res, next) {
  connection.query(`SELECT ADMIN_START FROM NFUN_ADMIN;`, (err, selRes) => {
    if (err) console.log(err)

    const startDate = selRes[0].ADMIN_START.toLocaleString()
    const nowDate = new Date().toLocaleString()
    console.log(nowDate)
    console.log(startDate)
    if (nowDate > startDate) {
      res.render('login', { title: '제목이 들어갈 자리' })
    } else {
      res.render('register', { title: '제목이 들어갈 자리' })
    }
  })
})

router

router.get('/home', function (req, res, next) {
  res.render('home', { title: '제목이 들어갈 자리' })
})

router.post('/register', async (req, res, next) => {
  const { name, password, email, belong } = req.body
  if (!req.body) {
    console.log('입력받은 값 없음')
    console.log(req.body)
    res.status(500)
    res.send('fail')
    return
  }

  connection.query(
    `SELECT * FROM NFUN_BOOK WHERE BOOK_EMAIL = ? && book_name = ?;`,
    [email, name],
    async (err, selres) => {
      const _selRes = selres[0] ? selres[0] : null
      if (err) {
        console.log(err)
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
  console.log(`Example app listening at http://localhost:${port}`)
})
