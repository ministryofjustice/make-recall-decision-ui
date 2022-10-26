// contact history filters
$('[data-js="contactTypeFiltersForm"]').on('submit', evt => {
  try {
    const $form = $(evt.target)
    $form.find('[name="contactTypes"]:checked').each((idx, el) => {
      dataLayer.push({
        event : 'contact_type_filter_submitted',
        type: el.dataset.type,
        category: el.dataset.group,
      })
    })
    const searchTerm = $form.find('[name="searchFilters"]').val()
    if (searchTerm) {
      dataLayer.push({
        event : 'contact_search_term_submitted',
        search_term: searchTerm,
      })
    }
  } catch (err) {
    console.error(err)
  }
})
