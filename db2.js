const mysql = require('mysql') // mysql 모듈 로드
const conn = {
  // mysql 접속 설정
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '1111',
  database: 'test',
}

var connection = mysql.createConnection(conn) // DB 커넥션 생성
connection.connect() // DB 접속

var testQuery =
  "INSERT INTO `MEMBERS` (`username`,`password`) VALUES ('test','153153');"

connection.query(testQuery, function (err, results, fields) {
  // testQuery 실행
  if (err) {
    console.log(err)
  }
  console.log(results)
})

testQuery = 'SELECT * FROM MEMBERS'

connection.query(testQuery, function (err, results, fields) {
  // testQuery 실행
  if (err) {
    console.log(err)
  }
  console.log(results)
})

connection.end() // DB 접속 종료
