// @ts-check

const express = require('express')

const ADMIN_ID = '000000'
const ADMIN_NAME = '관리자'

//const { getLogCollection } = require('./db')
const router = express.Router()
const mysql = require('mysql')
const app = express()
const fs = require('fs')
var path = require('path')
var mime = require('mime')

require('dotenv').config()
const { convertArrayToCSV } = require('convert-array-to-csv')
const converter = require('convert-array-to-csv')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', router)
app.use('/public', express.static('src/public'))
app.set('views', 'src/views')
app.set('view engine', 'pug')

var connection = mysql.createConnection({
  // host 바꾸기
  host: 'mysql',
  port: 3306,
  user: 'root',
  password: '153153',
  database: 'nfun',
})

var timeTrans = function () {
  const nowTime = new Date()

  const m = ('0' + (nowTime.getMonth() + 1)).slice(-2)
  const d = ('0' + nowTime.getDate()).slice(-2)
  const h = ('0' + nowTime.getHours()).slice(-2)
  const min = ('0' + nowTime.getMinutes()).slice(-2)
  const sec = ('0' + nowTime.getSeconds()).slice(-2)

  return `2021-${m}-${d} ${h}:${min}:${sec}`
}

// 메인페이지 라우팅
router.get('/', async (req, res) => {
  res.render('sign-in')
})

// 접속 라우팅
router.post('/sign-in', async (req, res) => {
  // 접속 에러
  if (!req.body) {
    console.log('잘못된 접근 입니다')
    return
  }
  // 입력 없음
  let { id, name, accessNum } = req.body
  accessNum = Number(accessNum)
  if (!id || !name) {
    console.log('입력정보를 모두 입력해주세요')
    return
  }
  console.log(`${id} ${name} 접속`)
  console.log(`${ADMIN_ID} ${ADMIN_NAME} 접속`)
  if (id === ADMIN_ID && name === ADMIN_NAME) {
    res.redirect('/admin')
    return
  }

  const selectLogQuery = `SELECT * FROM LOG WHERE ID = ${id};`
  connection.query(selectLogQuery, function (err, results, fields) {
    // selectLogQuery 실행
    if (err) {
      console.log(err)
    }
    if (results.length > 0) {
      console.log(`${name}님 중복접속`)

      const updateLogQuery = `UPDATE LOG SET LASTACCESS='${timeTrans()}', ACCESSNUM=ACCESSNUM+1 WHERE ID = '${id}';`
      connection.query(updateLogQuery, function (err, results, fields) {
        if (err) {
          console.log(err)
        }
        res.redirect('/home')
      })
    } else {
      const insertLogQuery = `INSERT INTO LOG (ACCESSNUM,ID,LASTACCESS,NAME) VALUES ('1','${id}','${timeTrans()}','${name}');`
      connection.query(insertLogQuery, function (err, results, fields) {
        if (err) {
          console.log(err)
        } else {
          console.log(`${name}님 최초접속`)
          res.redirect('/home')
        }
      })
    }
  })
})

// 홈화면 라우팅
router.get('/home', async (req, res) => {
  res.render('home')
})

// admin 페이지 라우팅
router.get('/admin', async (req, res) => {
  const selectLogQuery = `SELECT * FROM LOG;`
  connection.query(selectLogQuery, function (err, results, fields) {
    if (err) {
      console.log(err)
    } else {
      res.render('admin', { logs: results })
    }
  })
})

// csv 파일 다운로드
router.get('/export', async (req, res) => {
  var upload_folder = './'
  var file = upload_folder + 'log.csv' // ex) /upload/files/sample.txt

  const selectLogQuery = `SELECT * FROM LOG;`
  connection.query(selectLogQuery, function (err, results, fields) {
    if (err) {
      console.log(err)
    } else {
      const csv = convertArrayToCSV(results)
      console.log(csv)
      fs.writeFileSync('./log.csv', csv, {
        encoding: 'utf-8',
      })
      try {
        if (fs.existsSync(file)) {
          // 파일이 존재하는지 체크
          var filename = path.basename(file) // 파일 경로에서 파일명(확장자포함)만 추출
          var mimetype = mime.getType(file) // 파일의 타입(형식)을 가져옴

          res.setHeader(
            'Content-disposition',
            'attachment; filename=' + filename
          ) // 다운받아질 파일명 설정
          res.setHeader('Content-type', mimetype) // 파일 형식 지정

          var filestream = fs.createReadStream(file)
          filestream.pipe(res)
        } else {
          res.send('해당 파일이 없습니다.')
          return
        }
      } catch (e) {
        // 에러 발생시
        console.log(e)
        res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.')
        return
      }
    }
  })
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 작동되고 있습니다`)
})
