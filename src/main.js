// @ts-check
require('dotenv').config()

const express = require('express')

const { getLogCollection } = require('./db')
const router = express.Router()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', router)
app.use('/public', express.static('src/public'))
app.set('views', 'src/views')
app.set('view engine', 'pug')

router.get('/', async (req, res) => {
  res.render('sign-in')
})

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

  // db에서 참가자(people)객체 받아오기
  const logs = await getLogCollection()

  // 유저조회
  const existingLog = await logs.findOne({
    id,
  })

  const presentDate = new Date().toLocaleString()

  if (existingLog) {
    console.debug(`${name} 님 중복 접속`)

    await logs.updateOne(
      {
        id: existingLog.id,
      },
      {
        $set: {
          lastAccess: presentDate,
          accessNum: Number(existingLog.accessNum + 1),
        },
      }
    )
  } else {
    console.debug(`id : ${id} || name : ${name}`)

    await logs.insertOne({
      name,
      id,
      lastAccess: presentDate,
      accessNum: 1,
    })
  }
  res.redirect('/home')
})

router.get('/home', async (req, res) => {
  res.render('home')
})

const PORT = 3001

app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 작동되고 있습니다`)
})
