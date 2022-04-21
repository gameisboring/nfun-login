require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
// const { createHashedPassword, makePasswordHashed } = require('./lib/pw')
const requestIp = require('request-ip')
const logger = require('./config/winston')

const router = express.Router()
const app = express()
const { PORT, MAINPAGE_TITLE } = process.env

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

var pool = require('./lib/db.pool')
const { redirect } = require('express/lib/response')

app.set('views', 'src/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use('/', router)

router.all('/', (req, res, next) => {
  // 요청 body 변수 할당
  const { account, name } = req.body
  // 요청 로그 남기기
  let ip = requestIp.getClientIp(req)
  logger.info(
    `요청 라우트 : ${req.method} ${req.url} | FROM : ${ip} | ACCOUNT : ${account} | NAME : ${name}`
  )
  next()
})

router.get('/', async function (req, res, next) {
  checkStart(req, res)
})

router.get('/register', function (req, res, next) {
  res.redirect('/')
})

router.get('/login', function (req, res, next) {
  res.redirect('/')
})

router.post('/login', async (req, res, next) => {
  // 요청 body 변수 할당
  const { account, name } = req.body

  // 요청 로그 남기기
  let ip = requestIp.getClientIp(req)
  logger.info(
    `요청 라우트 : ${req.method} ${req.url} | FROM : ${ip} | ACCOUNT : ${account} | NAME : ${name}`
  )

  // 시청자 정보 조회
  try {
    const sql = 'SELECT * FROM `nfun`.`USERS` WHERE ACCOUNT = ? AND NAME = ?;'
    const [rows, fields] = await pool.query(sql, [account, name])
    // if 조회 정보 없음
    if (rows.length === 0) {
      logger.warn(`로그인 실패 | 등록번호 : ${account} | 이름 : ${name}`)
      res.json({ ok: false })
    } else {
      if (rows[0].ROLE == 'A') {
        // 관리자 제어
        logger.info(`관리자 로그인 | 등록번호 : ${account} | 이름 : ${name}`)
        res.status(200).json({ ok: 'ADMIN' })
        return
      } else if (rows[0].ROLE == 'V') {
        logger.info(`로그인 성공 | 등록번호 : ${account} | 이름 : ${name}`)
        res.status(200).json({ ok: true })
        return
      } else {
        logger.error(
          `유저 역할 정보 조회 실패 (POST /login SELECT) | 등록번호 : ${account} | 이름 : ${name}`
        )
        console.log(error)
        res.json({ ok: false })
      }
    }
  } catch (error) {
    logger.error(
      `유저 조회 실패 (POST /login SELECT) | 등록번호 : ${account} | 이름 : ${name}`
    )
    console.log(error)
    res.json({ ok: false })
  }
})

router.get('/home', async function (req, res) {
  const acc = req.query.acc
  if (acc) {
    try {
      const [rows, fields] = await pool.query(
        'SELECT NAME FROM `nfun`.`USERS` WHERE ACCOUNT = ?',
        [acc]
      )
      if (rows.length > 0) {
        const name = rows[0].NAME
        res.render('home', { NAME: name, title: MAINPAGE_TITLE })
        return
      }
    } catch (error) {
      console.log(error)
    }
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.write(
    "<script> alert('잘못된 접근입니다. 로그인을 통해 접속해주세요.'); "
  )
  res.write('window.location="/" </script>')
  res.end()
})

router.get('/admin', async function (req, res, next) {
  const acc = req.query.acc

  if (acc) {
    try {
      const [rows, fields] = await pool.query(
        "SELECT NAME FROM `nfun`.`USERS` WHERE ACCOUNT = ? AND ROLE = 'A'",
        [acc]
      )
      if (rows.length > 0) {
        const name = rows[0].NAME
        res.render('home2', { title: process.env.ADMINPAGE_TITLE })
        return
      }
    } catch (error) {
      console.log(error)
    }
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.write(
    "<script> alert('잘못된 접근입니다. 로그인을 통해 접속해주세요.'); "
  )
  res.write('window.location="/" </script>')
  res.end()
})
router.get('/admin/book', async function (req, res, next) {
  try {
    const sql = 'SELECT * FROM `nfun`.`USERS`;'
    const [rows, fields] = await pool.query(sql)
    rows.ok = true
    res.json(rows)
  } catch (error) {
    logger.error('유저 목록 조회 실패')
    console.log(error)
  }
})

router.get('/download', function (req, res, next) {
  try {
    const file = `${__dirname}/public/download/일정표.pdf`
    res.download(file)
  } catch (error) {
    console.log(error)
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`nstream web server listening at http://localhost:${PORT}`)
})

async function checkStart(req, res) {
  try {
    const [rows, fields] = await pool.query(`SELECT START FROM CONFIG;`)
    const startDate = new Date(rows[0].START)
    const nowDate = new Date()

    logger.info(
      `시작시간 : ${startDate.toLocaleString()} | 렌더링 : ${
        nowDate > startDate
      }`
    )

    if (nowDate > startDate) {
      res.render('login', { title: MAINPAGE_TITLE })
    } else {
      res.render('register', {
        title: MAINPAGE_TITLE,
        header: '행사 시작 전',
      })
    }
  } catch (error) {
    logger.error(error)
    console.log(error)
  }
}
