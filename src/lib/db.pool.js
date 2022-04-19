const mysql = require('mysql2/promise')
const logger = require('../config/winston')
require('dotenv').config()

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env

let pool = mysql.createPool({
  // host 바꾸기
  host: DB_HOST,
  user: DB_USER,
  port: 3306,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: 4,
})

pool.on('connection', function (connection) {
  connection.query('SET SESSION auto_increment_increment=1')
})

setInterval(function () {
  logger.info(`DB Ping | ${Date()}`)
  pool.query('SELECT 1').then(() => {})
}, 1000 * 60 * 60)

module.exports = pool
