$(document).ready(() => {
  removeMask()
})
function removeMask() {
  $('#mask').fadeOut(1000)
  $('.window').hide()
}

$(window).load(function () {
  $.ajax({
    url: '/admin/book',
    method: 'GET',
    async: true,
    dataType: 'JSON',
    success: (res) => {
      console.log(res.length + '123')
      if (res.length > 0) {
        for (var i in res) {
          bookRender(res[i])
        }
      } else {
        nullRender()
      }
    },
  })
})

var table = $('#booked-table')
function bookRender(userData) {
  const output = `
  <tbody class="bg-white divide-y divide-gray-200">
    <tr>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="">
            <div class="text-sm font-medium text-gray-900">${
              userData.NAME
            }</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${userData.ACCOUNT}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
        userData.ROLE === null ? '' : userData.ROLE
      }</td>
    </tr>
  </tbody>
  `

  const tbody = document.createElement('tbody')
  tbody.classList = 'bg-white divide-y divide-gray-200'

  tbody.innerHTML = output
  table.append(tbody)
}

function nullRender() {
  const output = `<tr>
    <td class="px-6 py-4 whitespace-nowrap">
    <div class="flex items-center">
      <div class="">
        <div class="text-sm font-medium text-gray-900">현재 입력된 유저 데이터가 없습니다</div>
      </div>
    </div>
  </td>
    </tr>`

  const tbody = document.createElement('tbody')
  tbody.classList = 'bg-white divide-y divide-gray-200'
  tbody.innerHTML = output
  table.append(tbody)
}
