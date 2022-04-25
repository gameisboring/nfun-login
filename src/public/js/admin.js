$(document).ready(() => {
  removeMask()
})
function removeMask() {
  $('#mask').fadeOut(1000)
  $('.window').hide()
}

function getUsersListWithAjax() {
  $.ajax({
    url: '/admin/book',
    method: 'GET',
    dataType: 'JSON',
    success: (res) => {
      if (res.length > 0) {
        console.log(res.length + '명의 참석자 정보 불러오기 성공')
        $('#booked-table').empty()
        for (var i in res) {
          bookRender(res[i])
        }
        return
      } else {
        nullRender()
      }
    },
  })
}

function getQuestionListWithAjax() {
  $.ajax({
    url: '/admin/question',
    method: 'GET',
    dataType: 'JSON',
    success: (res) => {
      if (res.length > 0) {
        console.log(res.length + '개의 질문 정보 불러오기 성공')
        $('#question-table').empty()
        for (var i in res) {
          questionRender(res[i])
        }
        return
      } else {
        nullRender()
      }
    },
  })
}
$(window).load(function () {
  getUsersListWithAjax()
  getQuestionListWithAjax()
})

function bookRender(userData) {
  const bTable = $('#booked-table')
  const output = `
  <tbody class="bg-white divide-y divide-gray-200">
    <tr>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="text-sm font-medium text-gray-900">${userData.NAME}</div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${userData.ACCOUNT}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
        userData.ROLE === 'A' ? '관리자' : '시청자'
      }</td>
    </tr>
  </tbody>
  `

  const tbody = document.createElement('tbody')
  tbody.classList = 'bg-white divide-y divide-gray-200'

  tbody.innerHTML = output
  bTable.append(tbody)
}

function questionRender(questionData) {
  const qTable = $('#question-table')

  const output = `<tbody class="bg-white divide-y divide-gray-200">
  <tr>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">${questionData.QST_NAME}</div>
      </div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${questionData.QST_TIME}</td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm text-gray-900">${questionData.QST_CONTEXT}</div>
    </td>
  </tr>
</tbody>`
  const tbody = document.createElement('tbody')
  tbody.classList = 'bg-white divide-y divide-gray-200'

  tbody.innerHTML = output
  qTable.append(tbody)
}

function nullQuestionRender() {
  const qTable = $('#question-table')
  const output = `<tr>
    <td class="px-6 py-4 whitespace-nowrap">
    <div class="flex items-center">
      <div class="">
        <div class="text-sm font-medium text-gray-900">현재 입력된 데이터가 없습니다</div>
      </div>
    </div>
  </td>
    </tr>`

  const tbody = document.createElement('tbody')
  tbody.classList = 'bg-white divide-y divide-gray-200'
  tbody.innerHTML = output
  qTable.append(tbody)
}

function getQuestionList() {
  $('#users').css('display', 'none')
  getQuestionListWithAjax()
  $('#questions').css('display', 'flex')
}

function getUsersList() {
  $('#questions').css('display', 'none')
  getUsersListWithAjax()
  $('#users').css('display', 'flex')
}

setInterval(() => {
  getQuestionListWithAjax()
  getUsersListWithAjax()
}, 1000 * 5)
