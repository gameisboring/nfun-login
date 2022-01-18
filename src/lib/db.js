const mysql = require('mysql2')
require('dotenv').config()

const host = process.env.DB_HOST
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const database = process.env.DB_DATABASE

const connection = mysql.createConnection({
  // host 바꾸기
  host: host,
  port: 3306,
  user: user,
  password: password,
  database: database,
})

connection.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
})

module.exports = connection
