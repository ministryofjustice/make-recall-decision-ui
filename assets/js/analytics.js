// open / close details
$('body').on('click', evt => {
  try {
    const classList = evt.target.classList
    // open / close view details
    if (classList.contains('govuk-details__summary') || classList.contains('govuk-details__summary-text')) {
      const $viewDetail = $(evt.target).closest('[data-js="viewDetail"]')
      if ($viewDetail.length) {
        const label = $viewDetail.attr('data-analytics-label')
        gtag('event', 'select_content', {
          content_type: label,
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
      gtag("event", "select_item", {
        item_list_name: 'contactFilterTypes',
        items: [
          {
            item_name: el.dataset.type,
            item_category: el.dataset.group,
          }
        ]
      });
    })
    const searchTerm = $form.find('[name="searchFilters"]').val()
    if (searchTerm) {
      gtag('event', 'search', {
        search_term: searchTerm,
      })
    }
  } catch (err) {
    console.error(err)
  }
})
