// open / close details
$('body').on('click', evt => {
  try {
    const classList = evt.target.classList
    // open / close view details
    if (classList.contains('govuk-details__summary') || classList.contains('govuk-details__summary-text')) {
      const $viewDetail = $(evt.target).closest('[data-js="viewDetail"]')
      if ($viewDetail.length) {
        let action = $viewDetail.attr('data-analytics-action')
        if (action && $viewDetail.attr('open')) {
          return
        }
        action = action || ($viewDetail.attr('open') ? 'closeDetails' : 'openDetails')
        const category = $viewDetail.attr('data-analytics-category')
        const label = $viewDetail.attr('data-analytics-label')
        // GA4
        gtag('event', 'select_content', {
          content_type: label,
        })
        // UA
        gtag('event', category, {
          event_category: action,
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
      // GA4
      gtag('event', 'select_item', {
        item_list_name: 'contactFilterTypes',
        items: [
          {
            item_name: el.dataset.type,
            item_category: el.dataset.group,
          },
        ],
      })
      // UA
      gtag('event', 'contactFilterType', {
        event_category: el.dataset.group,
        event_label: el.dataset.type,
      })
    })
    const searchTerm = $form.find('[name="searchFilters"]').val()
    if (searchTerm) {
      // GA4
      gtag('event', 'search', {
        search_term: searchTerm,
      })
      // UA
      gtag('event', 'contactFilterTerm', {
        event_category: searchTerm,
      })
    }
  } catch (err) {
    console.error(err)
  }
})
