// =====================================================
// Fix for issue with accessible-autocomplete which keeps previously selected values:
// https://github.com/alphagov/accessible-autocomplete/issues/205
//
// Adapted from this fix in the hmrc/customs-exports-internal-frontend project:
// https://github.com/hmrc/customs-exports-internal-frontend/pull/199
// =====================================================

$(function () {
  $('[data-gov-select-autocomplete]').each(function () {
    var selectFieldName = $(this).attr('id').replace('[', '\\[').replace(']', '\\]')
    // The autocomplete component takes the select element's id for the input element it creates, and appends
    // '-select' to the existing . Here we go in reverse, from the select to the input.
    var autocompleteInputFieldName = selectFieldName.replace('-select', '')

    const autocompleteInputField = document.getElementById(autocompleteInputFieldName)
    const docSelectField = document.getElementById(selectFieldName)
    const selectOptions = [...docSelectField.options].map(o => o.value).filter(v => v !== '')

    autocompleteInputField.addEventListener('focusout', setSelectToEmptyIfInputValueInvalid)

    function setSelectToEmptyIfInputValueInvalid() {
      const inputCurrentDisplayValue = autocompleteInputField.value
      if (!selectOptions.includes(inputCurrentDisplayValue)) {
        docSelectField.value = null
      }
    }
  })
})
