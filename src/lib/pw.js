const util = require('util')
const crypto = require('crypto')
var connection = require('../lib/db')

const createHashedPassword = async (password) => {
  const pbkdf2Promise = util.promisify(crypto.pbkdf2)
  const salt = await createSalt()
  const key = await pbkdf2Promise(password, salt, 104906, 64, 'sha512')
  const hashedPassword = key.toString('base64')
  console.log(`hashedPw : ${hashedPassword}`)

  return { hashedPassword, salt }
}

const createSalt = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) reject(err)
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
          crypto.pbkdf2(
            plainPassword,
            salt,
            104906,
            64,
            'sha512',
            (err, key) => {
              if (err) reject(err)
              resolve(key.toString('base64'))
            }
          )
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
