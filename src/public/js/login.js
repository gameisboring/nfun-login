function emailCheck(email) {
  var mailRegExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i
  return mailRegExp.test(email)
}

function passwordCheck(pw) {
  var pwRegExp = /^[A-Za-z0-9]{6,12}$/ //숫자와 문자 포함 형태의 6~12자리 이내의 암호 정규식
  return pwRegExp.test(pw)
}

$('#submitBtn').on('click', function () {
  let check = {}
  console.log('submitBtn clicked !')
  const email = $('input[name=email]').val()
  const password = $('input[name=password]').val()

  if (email) {
    if (!emailCheck($('input[name=email]').val())) {
      Swal.fire({
        icon: 'warning',
        title: '올바르지 않은 이메일 주소입니다',
      })
      $('input[name=email]').attr('required', 'required')
      return false
    } else {
      $('input[name=email]').addClass('valid:border-green-500')
      check.email = $('input[name=email]').val()
    }
  } else {
    $('input[name=email]').attr('required', 'required')
    Swal.fire({
      icon: 'warning',
      title: '이메일을 입력해주세요',
    })
    return false
  }

  if (password) {
    if (!passwordCheck($('input[name=password]').val())) {
      Swal.fire({
        icon: 'warning',
        title: '양식에 맞지 않는 비밀번호 입니다',
      })
      $('input[name=password]').attr('required', 'required')
      return false
    } else {
      $('input[name=password]').addClass('valid:border-green-500')
      check.password = $('input[name=password]').val()
    }
  } else {
    $('input[name=password]').attr('required', 'required')
    Swal.fire({
      icon: 'warning',
      title: '비밀번호를 입력해주세요',
    })
    return false
  }

  if (check.email && check.password) {
    login(check)
  }
})

function login(DATA) {
  $.ajax({
    url: '/login',
    async: true,
    type: 'post',
    data: DATA,
    dataType: 'JSON',
    success: (res) => {
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: '로그인 성공!',
        })
        location.replace('/home')
      } else {
        Swal.fire({
          icon: 'warning',
          title: '아이디 혹은 비밀번호를 확인해주세요',
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
