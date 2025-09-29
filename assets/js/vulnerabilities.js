$(function () {
  // Exclusive inputs are marked with data-behaviour="exclusive" in the template
  const $exclusive = $('input[data-behaviour="exclusive"]')
  const $normal = $('input[name="vulnerabilities"]:not([data-behaviour="exclusive"])')

  // If exclusive is chosen, uncheck all normal ones
  $exclusive.on('change', function () {
    if (this.checked) {
      $normal.prop('checked', false)
    }
  })

  // If any normal is chosen, uncheck all exclusive ones
  $normal.on('change', function () {
    if ($normal.is(':checked')) {
      $exclusive.prop('checked', false)
    }
  })
})

$(function () {
  const $form = $('form')
  const $exclusiveCheckbox = $('#vulnerabilities-none')
  const $exclusiveRadios = $('#conditional-vulnerabilities-none input[type="radio"]')

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
