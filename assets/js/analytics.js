// contact history filters
$('[data-js="contactTypeFiltersForm"]').on('submit', evt => {
  try {
    const $form = $(evt.target)
    $form.find('[name="contactTypes"]:checked').each((idx, el) => {
      dataLayer.push({
        event : 'select_item',
        item_list_name: 'contactFilterTypes',
        items: [
          {
            item_name: el.dataset.type,
            item_category: el.dataset.group,
          },
        ],
      })
    })
    const searchTerm = $form.find('[name="searchFilters"]').val()
    if (searchTerm) {
      dataLayer.push({
        event : 'search',
        search_term: searchTerm,
      })
    }
  } catch (err) {
    console.error(err)
  }
})
