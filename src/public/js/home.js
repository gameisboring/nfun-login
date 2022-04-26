$(document).ready(() => {
  removeMask()
})
function getAccount() {
  const account = new URL(window.location.href).searchParams.get('acc')
  return account
}
function removeMask() {
  $('#mask').fadeOut(1000)
  $('.window').hide()
  hit()
}

$('#question-submit-button').on('click', function () {
  if (!$('.question-box > textarea').val()) {
    Swal.fire({
      icon: 'warning',
      title: '질문하실 메세지를 작성해주세요',
    })
    return false
  }
  $.ajax({
    url: '/home/question',
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
        $('.question-box > textarea').val('')
      } else {
        Swal.fire({
          icon: 'error',
          title: '질문 제출에 실패했습니다',
        })
      }
    },
  })
})
