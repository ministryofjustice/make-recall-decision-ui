// open / close details
$('body').on('click', evt => {
  try {
    const classList = evt.target.classList
    // open / close view details
    if (classList.contains('govuk-details__summary') || classList.contains('govuk-details__summary-text')) {
      const $viewDetail = $(evt.target).closest('[data-js="viewDetail"]')
      if ($viewDetail.length) {
        let action = $viewDetail.attr('data-analytics-action')
        if (action && $viewDetail.attr('open')){
          return
        }
        action = action || ($viewDetail.attr('open') ? 'closeDetails' : 'openDetails')
        const category = $viewDetail.attr('data-analytics-category')
        const label = $viewDetail.attr('data-analytics-label')
        gtag('event', action, {
          event_category: category,
          event_label: label,
        })
      }
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
      gtag('event', el.dataset.group, {
        event_category: 'contactFilterType',
        event_label: el.dataset.type,
      })
    })
    const searchTerm = $form.find('[name="searchFilters"]').val()
    if (searchTerm) {
      gtag('event', searchTerm, {
        event_category: 'contactFilterTerm',
      })
    }
  } catch (err) {
    console.error(err)
  }
})
