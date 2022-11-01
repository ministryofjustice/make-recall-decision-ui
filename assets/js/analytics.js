window.dataLayer = window.dataLayer || [];

// contact history filters
$('[data-js="contactTypeFiltersForm"]').on('submit', evt => {
  try {
    const $form = $(evt.target)
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
        event : 'contact_search_term_submitted',
        search_term: searchTerm,
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