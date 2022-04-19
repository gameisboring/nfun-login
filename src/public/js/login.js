const input_account = $('input[name=account]')
const input_name = $('input[name=name]')

const accountCheck = /^[\s0-9]+$/

$('#submitBtn').on('click', function () {
  if (!input_account.val()) {
    input_account.attr('required', 'required')
    Swal.fire({
      icon: 'warning',
      title: '등록번호를 입력해주세요',
    })
    return false
  } else {
    if (!accountCheck.test(input_account.val())) {
      input_account.attr('required', 'required')
      Swal.fire({
        icon: 'warning',
        title: '등록번호에는\n숫자만 입력 가능합니다',
      })
      return false
    }
  }

  if (!input_name.val()) {
    input_name.attr('required', 'required')
    Swal.fire({
      icon: 'warning',
      title: '성함을 입력해주세요',
    })
    return false
  } else {
  }

  const postData = {
    account: input_account.val(),
    name: input_name.val(),
  }

  login(postData)
})

input_account.keypress(function (key) {
  if (key.keyCode == 13) {
    $('#submitBtn').click()
  }
})

input_name.keypress(function (key) {
  if (key.keyCode == 13) {
    $('#submitBtn').click()
  }
})

function login(postData) {
  $.ajax({
    url: '/login',
    type: 'POST',
    data: postData,
    dataType: 'JSON',
    success: (res) => {
      if (res.ok === true) {
        Swal.fire({
          icon: 'success',
          title: '로그인 되었습니다',
        }).then(() => {
          location.href = `/home?acc=${postData.account}`
        })
      } else if (res.ok === 'ADMIN') {
        Swal.fire({
          title: '이동할 페이지 선택',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          confirmButtonText: '관리자 페이지',
          cancelButtonColor: '#d33',
          cancelButtonText: '시청 페이지',
        }).then((result) => {
          if (result.isConfirmed) {
            location.href = `/admin?acc=${postData.account}`
          } else {
            location.href = `/home?acc=${postData.account}`
          }
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: '로그인 실패',
          text: '성함과 등록번호를 확인해주세요',
        }).then(() => {
          input_account.val('')
          input_name.val('')
        })
      }
    },
  })
}

$('input[name=email]').on('blur', function () {
  if (emailCheck($('input[name=email]').val())) {
    $('input[name=email]').addClass('valid:border-green-500')
    $('input[name=email]').removeClass('border-red-500')
  } else {
    $('input[name=email]').addClass('border-red-500')
    $('input[name=email]').removeClass('valid:border-green-500')
  }
})

$('input[name=password]').on('blur', () => {
  if (passwordCheck($('input[name=password]').val())) {
    $('input[name=password]').addClass('valid:border-green-500')
    $('input[name=password]').removeClass('border-red-500')
  } else {
    $('input[name=password]').addClass('border-red-500')
    $('input[name=password]').removeClass('valid:border-green-500')
  }
})
