$(window).load(function () {
  $.ajax({
    url: '/admin/book',
    method: 'GET',
    async: true,
    dataType: 'JSON',
    success: (res) => {
      for (var i in res) {
        bookRender(res[i])
      }
    },
  })
})
function bookRender(userData) {
  const output = `
  <tbody class="bg-white divide-y divide-gray-200">
    <tr>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="">
            <div class="text-sm font-medium text-gray-900">${
              userData.book_name
            }</div>
            <div class="text-sm text-gray-500">test@email.com</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${userData.book_belong}</div>
        <!-- <div class="text-sm text-gray-500">포지션</div> -->
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex text-xs leading-5 font-semibold">
          ${userData.book_email}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
        userData.BOOK_ROLE === null ? '' : userData.BOOK_ROLE
      }</td>
    </tr>
  </tbody>
  `
  const table = $('#booked-table')
  const tbody = document.createElement('tbody')
  tbody.classList = 'bg-white divide-y divide-gray-200'
  tbody.innerHTML = output
  table.append(tbody)
}

console.log('test')
