$('body').on('click', evt => {
  try {
    const classList = evt.target.classList
    // open / close view details
    if (classList.contains('govuk-details__summary') || classList.contains('govuk-details__summary-text')) {
      const $component = $(evt.target).closest('[data-qa="detailsSummary"]')
      const category = $component.attr('data-analytics-category')
      const label = $component.attr('data-analytics-label')
      const event = $component.attr('open') ? 'closeDetails' : 'openDetails'
      gtag('event', event, {
        event_category: category,
        event_label: label,
      })
    }
  } catch (err) {
    console.error(err)
  }
})
