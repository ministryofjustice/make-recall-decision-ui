window.EvidencePanel = function (options = {}) {
  this.options = options

  $('body').on('submit', async e => {
    const $form = $(e.target)
    if ($form.attr('data-id') === 'select-evidence-form') {
      e.preventDefault()
      const action = $form.attr('action')
      const method = $form.attr('method')
      const $isSelectedInput = $form.find('[name="isSelected"]')
      try {
        const body = {
          crn: $form.find('[name="crn"]').val(),
          contact: $form.find('[name="contact"]').val(),
          isSelected: $isSelectedInput.val(),
        }
        const response = await fetch(action, {
          method,
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const json = await response.json()
        if (json.reloadPage === true) {
          return window.location.reload()
        }
        $('#evidencePanel').html(json.success)
        $isSelectedInput.val(body.isSelected === '1' ? '0' : '1')
        const $button = $form.find('[data-id="add-button"]')
        $button.html(body.isSelected === '1' ? 'Add' : 'Remove')
        const $card = $form.closest('.app-summary-card')
        $card[body.isSelected === '1' ? 'removeClass' : 'addClass']('app-summary-card--highlight')
      } catch (err) {
        console.error(err)
      }
    }
  })
}
