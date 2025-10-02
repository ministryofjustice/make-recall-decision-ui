$(function () {
  const $form = $('form')
  const $exclusiveCheckbox = $('#NONE_OR_NOT_KNOWN')
  const $exclusiveRadios = $('#conditional-NONE_OR_NOT_KNOWN input[type="radio"]')

  // 1. On submit, if parent checkbox is not selected → clear radios
  $form.on('submit', function () {
    if (!$exclusiveCheckbox.is(':checked')) {
      $exclusiveRadios.prop('checked', false)
    }
  })

  // 2. If any radio inside is clicked → ensure parent checkbox is ticked
  $exclusiveRadios.on('change', function () {
    if ($(this).is(':checked')) {
      $exclusiveCheckbox.prop('checked', true).trigger('change')
    }
  })
})
