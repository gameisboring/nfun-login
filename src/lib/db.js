const mysql = require('mysql')

var connection = mysql.createConnection({
  // host 바꾸기
  host: 'nstream.kr',
  port: 3306,
  user: 'admin',
  password: '153153',
  database: 'nfun',
})

connection.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
})

module.exports = connection
