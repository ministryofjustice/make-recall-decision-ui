// How to use:
// For pages with one "copy to clipboard" button:
// - assign an attribute data-js='copy-to-clipboard-text' to the text element
// - assign an attribute data-js='copy-to-clipboard-btn' to the button
// For pages with multiple "copy to clipboard" buttons:
// - make the data-js attribute on the text elements unique
// - assign an id to the button that matches the content of the data-js on the text element
$('[data-js="copy-to-clipboard-btn"]').on('click', evt => {
  const $ariaLiveRegion = $('[data-js="aria-live-region"]')
  const showError = () => $ariaLiveRegion.text('Unable to copy text')
  let buttonId = 'copy-to-clipboard-text'
  if (!!evt.delegateTarget.id) {
    buttonId = evt.delegateTarget.id
  }
  const text = $(`[data-js="${buttonId}"]`).text()
  if (!text) {
    showError()
  } else {
    navigator.clipboard.writeText(text).then(() => {
      $ariaLiveRegion.text('Text copied to clipboard')
      const $button = $(evt.target)
      $button.text('Text copied')
    }, showError)
  }
})
