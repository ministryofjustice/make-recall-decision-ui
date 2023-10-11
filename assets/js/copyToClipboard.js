
$('[data-js="copy-to-clipboard-btn"]').on('click', (evt) => {
  const $ariaLiveRegion = $('[data-js="aria-live-region"]')
  const showError = () => $ariaLiveRegion.text('Unable to copy text')
  const text = $('[data-js="copy-to-clipboard-text"]').text()
  const text2 = $('[data-js="copy-to-clipboard-text2"]').text()
  if (evt.delegateTarget.id === 'copy-to-clipboard-text') {
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
  }
  if (evt.delegateTarget.id === 'copy-to-clipboard-text2') {
    if (!text2) {
      showError()
    } else {
      navigator.clipboard.writeText(text2).then(
        () => {
          $ariaLiveRegion.text('Text copied to clipboard')
          const $button = $(evt.target)
          $button.text('Text copied')
        },
        showError
      );
    }
  }
})
