if (!session) {
  console.log('잘못된 접속')
}

/* setInterval(function () {
  fetch('/ping.php')
    .then((res) => {
      if (res.ok) return res.json()
    })
    .then((json) => {
      if (json.status == 'success') {
        if (json.broadcast == 0) {
          console.log('방송이 끝났습니다.')
        }
      }
    })
}, 30 * 1000) */

const questionInput = document.querySelector('.info > .question-box > input')
const questionUser = document.querySelector('.info > .question-box > #session')
console.log(questionUser.value)
const questionBtn = document.querySelector('.info > .question-box > button')

questionInput.addEventListener('keyup', function (e) {
  if (e.keyCode == 13) questionBtn.click()
})

questionBtn.addEventListener('click', function () {
  if (questionInput.value) {
    if (confirm('질문을 전송하시겠습니까?')) {
      const question = {
        question: questionInput.value,
        name: questionUser.value,
      }
      /*let formdata = new FormData()
       formdata.append('question', questionInput.value)
      formdata.append('user', document.getElementById('session').value)
      console.log(formdata) */
      fetch('/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(question),
      }).then((res) => {
        if (res) {
          alert('질문 전송에 성공했습니다')
        } else {
          alert('질문 전송에 실패했습니다')
        }
        questionInput.value = ''
      })
    } else {
      console.log('NO')
    }
  }
})
