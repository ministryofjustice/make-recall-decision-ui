
$('[data-js="copy-to-clipboard-btn"]').on('click', (evt) => {
  const $ariaLiveRegion = $('[data-js="aria-live-region"]')
  const showError = () => $ariaLiveRegion.text('Unable to copy text')
  const text = $('[data-js="copy-to-clipboard-text"]').text()
  if (!text) {
    showError()
  } else {
    navigator.clipboard.writeText(text).then(
      () => {
        $ariaLiveRegion.text('Text copied to clipboard')
  const $button = $(evt.target)
        $button.text('Text copied')
      },
      showError
    );
  }
})