function getAccount() {
  const account = new URL(window.location.href).searchParams.get('acc')
  return account
}
$(document).ready(() => {
  removeMask()
})
function removeMask() {
  $('#mask').fadeOut(1000)
  $('.window').hide()
  hit()
}

function hit() {
  $.ajax({
    url: '/hit',
    type: 'POST',
    dataType: 'JSON',
    success: (res) => {
      console.log(
        '2022년도 보건의료정보관리자 및 교수 워크숍에 참가하신 것을 환영합니다'
      )
    },
  })
}

$('#question-submit-button').on('click', function () {
  $.ajax({
    url: '/question',
    type: 'POST',
    data: {
      account: getAccount(),
      name: $('.question-box > input').val(),
      context: $('.question-box > textarea').val(),
    },
    dataType: 'JSON',
    success: (res) => {
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: '질문이 성공적으로 제출되었습니다',
        })
      } else {
      }
    },
  })
})
