const util = require('util')
const crypto = require('crypto')
var connection = require('../lib/db')

// 암호화된 패스워드 생성
const createHashedPassword = async (password) => {
  // pbkdf2 알고리즘
  const pbkdf2Promise = util.promisify(crypto.pbkdf2)
  // 암호화를 위한 salt 생성
  const salt = await createSalt()
  // 입력받은 password 와 생성된 salt 값으로 새로운 key 생성
  const key = await pbkdf2Promise(password, salt, 21, 64, 'sha512')
  // base64 인코딩
  const hashedPassword = key.toString('base64')
  console.log(`hashedPw : ${hashedPassword}`)

  return { hashedPassword, salt }
}

const createSalt = () =>
  new Promise((resolve, reject) => {
    // 64바이츠 랜덤 String 생성
    crypto.randomBytes(64, (err, buf) => {
      if (err) reject(err)
      // base64 인코딩
      resolve(buf.toString('base64'))
    })
  })

const makePasswordHashed = (email, plainPassword) =>
  new Promise(async (resolve, reject) => {
    connection.query(
      'SELECT BOOK_SALT,BOOK_PASSWORD FROM NFUN_BOOK WHERE book_email = ?',
      [email],
      (err, res) => {
        if (err) {
          console.log(err)
          return
        }
        if (res.length > 0) {
          const salt = res[0].BOOK_SALT
          crypto.pbkdf2(plainPassword, salt, 21, 64, 'sha512', (err, key) => {
            if (err) reject(err)
            resolve(key.toString('base64'))
          })
        } else {
          resolve(false)
        }
      }
    )
  })

module.exports = {
  createHashedPassword,
  createSalt,
  makePasswordHashed,
}
