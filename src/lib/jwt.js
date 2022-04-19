require('dotenv').config()
const jwt = require('jsonwebtoken')

const token = () => {
  return {
    access(id) {
      return jwt.sign({ account }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1 days',
        algorithm: 'RS256',
      })
    },
    refresh(id) {
      return jwt.sign({ account }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7 days',
        algorithm: 'RS256',
      })
    },
  }
}
