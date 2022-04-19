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

app.set('views', 'src/views')
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use('/', router)

router.get('/', async function (req, res, next) {
  let ip = requestIp.getClientIp(req)
  logger.info(`요청 : ${req.method} ${req.url} | IP : ${ip}`)
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
  let ip = requestIp.getClientIp(req)

  logger.info(
    `REQUEST : ${req.method} ${req.url} | FROM : ${ip} | ACCOUNT : ${account} | NAME : ${name}`
  )

  if (name === '관리자' && account === '000000') {
    logger.info('관리자 로그인')
    res.status(200).json({ ok: 'ADMIN' })
    return
  }

  try {
    const sql = 'SELECT * FROM `nfun`.`USERS` WHERE ACCOUNT = ? AND NAME = ?;'
    const [rows, fields] = await pool.query(sql, [account, name])
    if (!rows) {
      try {
        const sql =
          'INSERT INTO `nfun`.`USERS`(`NAME`,`ACCOUNT`,`ROLE`) VALUES (?,?,?);'
        const insertResult = await pool.query(sql, [name, account, 'viewer'])
        logger.info(
          `신규등록 및 로그인 성공 | 등록번호 : ${account} | 이름 : ${name}`
        )
        res.json({ ok: true }).status(200)
      } catch (error) {
        logger.error(
          `sql 에러(POST /login INSERT) | 등록번호 : ${account} | 이름 : ${name}`
        )
        console.log(error)
        res.json({ ok: false })
      }
    } else {
      logger.info(`로그인 성공 | 등록번호 : ${account} | 이름 : ${name}`)
      res.json({ ok: true }).status(200)
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
  try {
    const acc = req.query.acc

    const [rows, fields] = await pool.query(
      'SELECT NAME FROM `nfun`.`USERS` WHERE ACCOUNT = ?',
      [acc]
    )
    if (rows.length > 0) {
      const name = rows[0].NAME
      res.render('home', { NAME: name })
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.write(
        "<script> alert('잘못된 접근입니다. 로그인을 통해 접속해주세요.'); "
      )
      res.write('window.location="/" </script>')
      res.end()
    }
  } catch (error) {
    console.log(error)
  }
})

router.get('/admin', function (req, res, next) {
  res.render('home2', { title: process.env.ADMINPAGE_TITLE })
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

/*router.get('/home', function (req, res, next) {
  res.render('home', { title: MAINPAGE_TITLE })
})

 router.post('/register', async (req, res, next) => {
  const { name, password, email, belong } = req.body
  if (!req.body) {
    console.log(req.body)
    res.status(500)
    res.send('fail')
    return
  }

  pool.query(
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
        logger.error(`중복 가입 요청 | FROM : ${ip}`)
        res.json({ ok: false })
        return
      }

      const { hashedPassword, salt } = await createHashedPassword(password)
      pool.query(
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
}) */

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
