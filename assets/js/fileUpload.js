import { MultiFileUpload } from '@ministryofjustice/frontend'

/**
 * Consider A Recall MultiFileUpload
 * Extends MultiFileUpload but overrides the various places
 */
class CaRMultiFileUpload extends MultiFileUpload {
  getSuccessLabelHtml() {
    return `<strong class="govuk-tag govuk-tag--green">Uploaded</strong>`
  }

  /**
   * @param {UploadResponseError['error']} error
   */
  getErrorHtml(error) {
    return `<span class="govuk-error-message govuk-!-margin-bottom-0">${error.message}</span>`
  }

  /**
   * @param {File} file
   */
  getFileRow(file) {
    const $row = document.createElement('div')
    $row.classList.add('govuk-summary-list__row', 'moj-multi-file-upload__row')
    $row.innerHTML = `
      <dt class="govuk-summary-list__value">
        <div class="govuk-!-margin-bottom-0 govuk-form-group">
          <p class="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-2 moj-multi-file-upload__message">${file.name}</p>
          <span class="moj-multi-file-upload__progress">
            <strong class="govuk-tag govuk-tag--yellow">
              Uploading
            </strong>
          </span>
        </div>
      </dt>
      <dd class="govuk-summary-list__actions moj-multi-file-upload__actions"></dd>
    `
    return $row
  }

  /**
   * @param {UploadResponseFile} file
   */
  getDeleteButton(file) {
    const $button = document.createElement('button')
    $button.setAttribute('type', 'button')
    $button.setAttribute('name', 'delete')
    $button.setAttribute('value', file?.id ?? '')
    $button.classList.add('moj-multi-file-upload__delete', 'reset-button', 'link-button', 'govuk-!-margin-bottom-0')
    $button.innerHTML = `Delete <span class="govuk-visually-hidden">${file?.originalname}</span>`
    return $button
  }

  /**
   * @param {File} file
   */
  uploadFile(file) {
    this.config.hooks.entryHook(this, file)
    const $item = this.getFileRow(file)
    const $message = $item.querySelector('.moj-multi-file-upload__message')
    const $actions = $item.querySelector('.moj-multi-file-upload__actions')
    const $progress = $item.querySelector('.moj-multi-file-upload__progress')
    const $rowFormGroup = $item.querySelector('.govuk-form-group')

    const formData = new FormData()
    formData.append('documents', file)
    this.$feedbackContainer.querySelector('.moj-multi-file-upload__list').append($item)
    const xhr = new XMLHttpRequest()
    const onLoad = () => {
      if (xhr.status < 200 || xhr.status >= 300 || !('success' in xhr.response)) {
        return onError()
      }

      $message.innerHTML = xhr.response.file.originalname
      $progress.innerHTML = this.getSuccessLabelHtml()
      this.$status.textContent = xhr.response.success.messageText
      $actions.append(this.getDeleteButton(xhr.response.file))
      this.config.hooks.exitHook(this, file, xhr, xhr.statusText)
    }
    const onError = () => {
      const error = new Error(
        xhr.response && 'error' in xhr.response ? xhr.response.error.message : xhr.statusText || 'Upload failed',
      )
      $progress.innerHTML = this.getErrorHtml(error)
      $rowFormGroup.classList.add('govuk-form-group--error')
      $actions.append(this.getDeleteButton(xhr.response.file))
      this.$status.textContent = error.message
      this.config.hooks.errorHook(this, file, xhr, xhr.statusText, error)
    }
    xhr.addEventListener('load', onLoad)
    xhr.addEventListener('error', onError)
    xhr.open('POST', this.config.uploadUrl)
    // Adding this request header allows us to check `req.xhr` in the controllers
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    xhr.responseType = 'json'
    xhr.send(formData)
  }

  /**
   * @param {MouseEvent} event - Click event
   */
  onFileDeleteClick(event) {
    const $button = event.target
    if (
      !$button ||
      !($button instanceof HTMLButtonElement) ||
      !$button.classList.contains('moj-multi-file-upload__delete')
    ) {
      return
    }
    event.preventDefault() // if user refreshes page and then deletes

    const $rows = Array.from(this.$feedbackContainer.querySelectorAll('.moj-multi-file-upload__row'))
    const $rowDelete = $rows.find($row => $row.contains($button))

    // Error occured, so just remove the row rather than do the XHR
    if (typeof $button.getAttribute('value') === 'undefined') {
      $rowDelete.remove()
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.addEventListener('load', () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        return
      }
      if ($rows.length === 1) {
        this.$feedbackContainer.classList.add('moj-hidden')
      }
      const $rowDelete = $rows.find($row => $row.contains($button))
      if ($rowDelete) $rowDelete.remove()
      this.config.hooks.deleteHook(this, undefined, xhr, xhr.statusText)
    })
    xhr.open('POST', this.config.deleteUrl)
    xhr.setRequestHeader('Content-Type', 'application/json')
    // Adding this request header allows us to check `req.xhr` in the controllers
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    xhr.responseType = 'json'
    xhr.send(
      JSON.stringify({
        [$button.name]: $button.value,
      }),
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const $multiFileUpload = document.querySelector('[data-module="moj-multi-file-upload"]')

  // Shared URL for the form action (when JS is disabled) and the AJAX upload
  const formUrl = $multiFileUpload.parentElement.getAttribute('action')

  new CaRMultiFileUpload($multiFileUpload, {
    uploadUrl: formUrl,
    deleteUrl: formUrl,
  })
})
