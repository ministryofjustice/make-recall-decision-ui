window.dataLayer = window.dataLayer || [];

// contact history filters
$('[data-js="contactTypeFiltersForm"]').on('submit', evt => {
  try {
    window.dataLayer.push({
      event : 'contact_filter_form_submitted'
    })
    const $form = $(evt.target)
    $form.find('[name="includeSystemGenerated"]:checked').each((idx, el) => {
      window.dataLayer.push({
        event : 'contact_include_system_generated_submitted'
      })
    })
    $form.find('[name="contactTypesSystemGenerated"]:checked').each((idx, el) => {
      window.dataLayer.push({
        event : 'contact_type_system_generated_filter_submitted',
        type: el.dataset.type,
        category: el.dataset.group,
      })
    })
    $form.find('[name="contactTypes"]:checked').each((idx, el) => {
      window.dataLayer.push({
        event : 'contact_type_filter_submitted',
        type: el.dataset.type,
        category: el.dataset.group,
      })
    })
    const searchTerm = $form.find('[name="searchFilters"]').val()
    if (searchTerm) {
      window.dataLayer.push({
        event : 'contact_search_term_submitted'
      })
    }
    const dateInput = $form.find('.govuk-date-input__input').val()
    if (dateInput) {
      window.dataLayer.push({
        event : 'contact_date_filter_submitted'
      })
    }
  } catch (err) {
    console.error(err)
  }
})

// page load performance data (web vitals)
// https://github.com/GoogleChrome/web-vitals#using-gtagjs-google-analytics-4
try {
  const { onCLS, onFID, onLCP } = window.webVitals

  function sendToGoogleAnalytics({ name, delta, id }) {
    window.dataLayer.push({
      event: 'coreWebVitals',
      webVitalsMeasurement: {
        name: 'page_load_' + name,
        value: delta,
        id,
      },
    });
  }

  onCLS(sendToGoogleAnalytics);
  onFID(sendToGoogleAnalytics);
  onLCP(sendToGoogleAnalytics);
} catch(err) {
  console.error(err)
}