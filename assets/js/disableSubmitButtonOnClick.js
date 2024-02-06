$('form button').on('click', function () {
  setTimeout(() => {
    $(this).prop('disabled', true)
  }, 0)
})
