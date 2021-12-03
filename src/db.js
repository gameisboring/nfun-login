const { MongoClient } = require('mongodb')

/* // root 폴더 -> .env 파일에 db 정보 입력 후 뽑아서 사용
const { MONGO_PASSWORD, MONGO_CLUSTER, MONGO_USER, MONGO_DBNAME } = process.env

// 완성된 mongoDB url
const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DBNAME}?retryWrites=true&w=majority`
console.log(uri)
// DB에 접속한 사용자 객체
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}) */

const mongoose = require('mongoose')

// [ CONFIGURE mongoose ]

// CONNECT TO MONGODB SERVER
var db = mongoose.connection
db.on('error', console.error)
db.once('open', function () {
  // CONNECTED TO MONGODB SERVER
  console.log('Connected to mongod server')
})

mongoose.connect('mongodb://127.0.0.1:27017/?compressors=none', {
  useNewUrlParser: true,
})

/* 
// 연결여부판별
let didConnect = false

// mongoDB 컬렉션 받아오기
async function getCollection(name) {
  if (!didConnect) {
    await client.connect()
    didConnect = true
  }
  return client.db().collection(name)
}

async function getLogCollection() {
  return getCollection('log')
}
 */

// exports 해주는 module은 컬렉션리스트 여야 함
module.exports = {
  getLogCollection,
}
