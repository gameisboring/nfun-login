const express = require('express')
const bodyParser = require('body-parser')
const requestIp = require('request-ip')
const logger = require('./config/winston')
const errorController = require('./lib/errorController')
require('dotenv').config()

const xlsx = require('xlsx')
const fs = require('fs')

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

// 서버가동
app.listen(PORT, '0.0.0.0', () => {
  console.log(`nstream web server listening at http://localhost:${PORT}`)
})

// 메인(로그인)
router.get('/', async function (req, res, next) {
  logReqInfo(req)
  checkStart(req, res)
})
// 등록
router.get('/register', function (req, res, next) {
  logReqInfo(req)
  res.redirect('/')
})
// 로그인
router.get('/login', function (req, res, next) {
  logReqInfo(req)
  res.redirect('/')
})

// 로그인 정보 처리 미들웨어
router.post('/login', async (req, res, next) => {
  // 요청 body 변수 할당
  const { account, name } = req.body
  logReqInfo(req, account, name)
  // 시청자 정보 조회
  try {
    const sql = 'SELECT * FROM `nfun`.`USERS` WHERE ACCOUNT = ? AND NAME = ?;'
    const [rows, fields] = await pool.query(sql, [account, name])
    // if 조회 정보 없음
    if (rows.length === 0) {
      logger.error(`로그인 실패 | 등록번호 : ${account} | 이름 : ${name}`)
      res.json({ ok: false })
    } else {
      if (rows[0].ROLE == 'A') {
        // 관리자 제어
        logger.info(`관리자 로그인 | 등록번호 : ${account} | 이름 : ${name}`)
        res.status(200).json({ ok: true, role: 'a' })
        return
      } else if (rows[0].ROLE == 'V') {
        logger.info(
          `로그인 성공 | 등록번호 : ${account} | 이름 : ${name} | 직책 : ${
            rows[0].ROLE === 'A' ? '관리자' : '시청자'
          }`
        )
        res.status(200).json({ ok: true, role: 'v' })
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

// 홈 화면
router.get('/home', async function (req, res) {
  const account = req.query.acc
  let ip = requestIp.getClientIp(req)

  if (account) {
    try {
      const [rows, fields] = await pool.query(
        'SELECT NAME FROM `nfun`.`USERS` WHERE ACCOUNT = ?',
        [account]
      )
      const name = rows[0].NAME
      if (rows.length > 0) {
        const sql =
          'insert into NFUN.LOGS(LOGS_ACCOUNT,LOGS_NAME) values (?,(SELECT NAME FROM USERS WHERE ACCOUNT = ?));'

        const [INSERT_rows, INSERT_fields] = await pool.query(sql, [
          account,
          account,
        ])
        if (INSERT_rows.affectedRows <= 0) {
          logger.warn(
            `조회 처리 실패 | 요청 라우트 : ${req.method} ${req.url} | FROM : ${ip} | ACCOUNT : ${account} | NAME : ${name}`
          )
        } else {
          logReqInfo(req, account, name)
        }
        res.render('home', {
          account: account,
          name: name,
          title: MAINPAGE_TITLE,
        })
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

// 홈화면 질문 처리 미들웨어
router.post('/home/question', async function (req, res) {
  try {
    const { account, name, context } = req.body
    logReqInfo(req, account, name, { QUESTION: context })
    const sql = ` INSERT INTO NFUN.QUESTION (QST_CONTEXT,QST_ACCOUNT,QST_NAME) VALUES (?,?,?);`
    const [rows, fields] = await pool.query(sql, [context, account, name])

    if (rows.affectedRows === 1) {
      res.json({ ok: true })
    }
  } catch (error) {
    logger.error()
    console.log(error)
  }
})

// 관리자 화면
router.get('/admin', async function (req, res, next) {
  const account = req.query.acc

  if (account) {
    try {
      const [rows, fields] = await pool.query(
        "SELECT NAME FROM `nfun`.`USERS` WHERE ACCOUNT = ? AND ROLE = 'A'",
        [account]
      )
      if (rows.length > 0) {
        const name = rows[0].NAME
        logReqInfo(req, account, name)
        res.render('admin', { title: process.env.ADMINPAGE_TITLE })
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

// 관리자 유저 리스트 쿼리
router.get('/admin/book', async function (req, res, next) {
  logReqInfo(req)
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

// 관리자 유저 리스트 다운로드
router.get('/admin/book/download', async function (req, res, next) {
  logReqInfo(req)
  try {
    const sql =
      'SELECT NAME 이름, ACCOUNT 등록번호 FROM `nfun`.`USERS` WHERE ROLE = "V";'

    const [rows, fields] = await pool.query(sql)
    const csvFromRowsObject2 = xlsx.utils.json_to_sheet(rows)
    const stream = xlsx.stream.to_csv(csvFromRowsObject2)

    const fileName =
      __dirname +
      '/public/download/' +
      process.env.MAINPAGE_TITLE +
      '_참가자리스트.csv'

    stream.pipe(fs.createWriteStream(fileName))

    res.download(fileName)
  } catch (error) {
    logger.error('유저 목록 조회 실패')
    console.log(error)
  }
})

// 관리자 질문 리스트 쿼리
router.get('/admin/question', async function (req, res, next) {
  logReqInfo(req)
  try {
    const sql = 'SELECT * FROM `nfun`.`QUESTION`;'
    const [rows, fields] = await pool.query(sql)
    rows.ok = true
    res.json(rows)
  } catch (error) {
    logger.error('질문 목록 조회 실패')
    console.log(error)
  }
})

// 관리자 질문 리스트 다운로드
router.get('/admin/question/download', async function (req, res, next) {
  logReqInfo(req)
  try {
    const sql =
      'SELECT QST_TIME 질문시각 ,QST_NAME 이름,QST_ACCOUNT 면허번호,QST_CONTEXT 질문내용 FROM `nfun`.`QUESTION`;'

    const [rows, fields] = await pool.query(sql)
    rows.forEach((data) => {
      data.질문시각 = new Date(data.질문시각).toLocaleString()
    })

    const fileServe = new Promise((res, rej) => {
      if (rows) {
        const csvFromRowsObject2 = xlsx.utils.json_to_sheet(rows)
        const stream = xlsx.stream.to_csv(csvFromRowsObject2)
        const fileName =
          __dirname +
          '/public/download/' +
          process.env.MAINPAGE_TITLE +
          '_질문리스트.csv'
        stream.pipe(fs.createWriteStream(fileName))
        res(fileName)
        console.log('2222')
      }
    })

    fileServe.then((fileName) => {
      res.sendFile(fileName)
      console.log('3333')
    })
  } catch (error) {
    logger.error('질문 목록 조회 실패')
    console.log(error)
  }
})

// 어드민 정보 조회 쿼리
router.get('/admin/info', async function (req, res, next) {
  logReqInfo(req)

  try {
    const sql =
      'SELECT (SELECT COUNT(*) FROM NFUN.LOGS) HITS , (SELECT COUNT(*) FROM NFUN.USERS) USERS, (SELECT COUNT(*) FROM NFUN.QUESTION) QUESTIONS, START FROM NFUN.CONFIG;'
    const [rows, fields] = await pool.query(sql)
    rows.ok = true
    res.json(rows).status(200)
  } catch (error) {
    logger.error('관리자 정보 목록 조회 실패')
    console.log(error)
  }
})

// 첨부자료 다운로드
router.get('/download', function (req, res, next) {
  logReqInfo(req, req.query.acc, req.query.name)
  try {
    const file = `${__dirname}/public/download/일정표.pdf`
    res.download(file)
  } catch (error) {
    console.log(error)
  }
})

//
async function checkStart(req, res) {
  try {
    const [rows, fields] = await pool.query(`SELECT START FROM CONFIG;`)
    const startDate = new Date(rows[0].START)
    const nowDate = new Date()

    if (nowDate > startDate) {
      res.render('login', { title: MAINPAGE_TITLE })
    } else {
      res.render('register', {
        title: MAINPAGE_TITLE,
        header: '행사 시작 전',
      })
    }
  } catch (error) {
    logError(req)
    console.log(error)
  }
}

// 요청 로그 남기기
function logReqInfo(req, account, name, object) {
  const ip = requestIp.getClientIp(req)
  if (object) {
    var key = Object.keys(object)
    var val = Object.values(object)
  }

  const agent = req.header('User-Agent')
  logger.info(
    `${req.method} ${req.url} | FROM : ${ip} | ACCOUNT : ${
      account ? account : 'null'
    } | NAME : ${name ? name : 'null'} | USERAGENT : ${agent} | ${
      key != undefined ? key + ' : ' + val : ''
    }`
  )
}

// 에러 로그 남기기
function logError(req, account, name, object) {
  const ip = requestIp.getClientIp(req)
  if (object) {
    const key = Object.keys(object)
    const val = Object.values(object)
  }
  logger.error(
    `${req.method} ${req.url} | FROM : ${ip} | ACCOUNT : ${
      account ? account : 'null'
    } | NAME : ${name ? name : 'null'} | ${key ? key + ' : ' + val : ''}`
  )
}

//* 에러 컨트롤 */
app.use(errorController.pageNotFoundError)
app.use(errorController.respondInternalError)
