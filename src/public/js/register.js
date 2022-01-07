$('input[name=name]').on('blur', () => {
  if ($('input[name=name]').val().length >= 3) {
    $('input[name=name]').addClass('valid:border-green-500')
  }
})

$('#submitBtn').on('click', function () {
  let check = {}

  if ($('input[name=name]').val()) {
    check.name = $('input[name=name]').val()
  } else {
    $('input[name=name]').attr('required', 'required')
    Swal.fire({
      icon: 'warning',
      title: '이름을 입력해주세요',
    })
    return false
  }

  if ($('input[name=email]').val()) {
    var mailRegExp =
      /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i

    if (!mailRegExp.test($('input[name=email]').val())) {
      Swal.fire({
        icon: 'warning',
        title: '이메일 양식에 맞지 않습니다',
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

  if ($('input[name=password]').val()) {
    var passRule = /^[A-Za-z0-9]{6,12}$/ //숫자와 문자 포함 형태의 6~12자리 이내의 암호 정규식
    if (!passRule.test($('input[name=password]').val())) {
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

  if (check.name && check.email && check.password) {
    $.ajax({
      url: 'register',
      type: 'POST',
      dataType: 'Json',
      data: { DATA: 'data' },
      success: (res) => {
        console.log(res)
        Swal.fire({
          icon: 'success',
          text: '사전등록에 성공했습니다',
        })
      },
      error: (err) => {
        console.log(err)
        Swal.fire({
          icon: 'error',
          text: '사전등록에 실패했습니다',
        })
      },
    })
  }
})
