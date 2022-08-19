// open / close details
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

// contact history filters
$('[data-js="contactTypeFiltersForm"]').on('submit', evt => {
  try {
    const $form = $(evt.target)
    $form.find('[name="contactTypes"]:checked').each((idx, el) => {
      gtag('event', 'contactHistoryFilterByType', {
        event_category: el.dataset.group,
        event_label: el.dataset.type,
      })
    })
    const searchTerm = $form.find('[name="searchFilters"]').val()
    if (searchTerm) {
      gtag('event', 'contactHistoryFilterByTerm', {
        event_category: searchTerm,
      })
    }
  } catch (err) {
    console.error(err)
  }
})
