/* eslint-disable */
const openText = 'Open'
const closeText = 'Close'

const openAllButton = document.querySelector('[data-js="predictor-timeline__toggle-all"]')
const openCloseButtons = document.querySelectorAll('[data-js="predictor-timeline__toggle-section"]')
const sections = document.querySelectorAll('[data-js="predictor-timeline__section"]')
const sectionHiddenClass = 'predictor-timeline-section--hidden'

function toggleButton(button, newState) {
  const label = button.querySelector('[data-js="score-action-label"]')
  if (newState === 'open') {
    button.setAttribute('aria-expanded', 'true')
    label.innerText = closeText
  } else {
    button.setAttribute('aria-expanded', 'false')
    label.innerText = openText
  }
}

function openCloseButtonClick (e) {
  e.preventDefault()
  const button = e.currentTarget
  const isCurrentlyOpen = button.getAttribute('aria-expanded') === 'true'
  toggleButton(button, isCurrentlyOpen ? 'close' : 'open')
  const sectionId = button.getAttribute('aria-controls')
  const section = document.getElementById(sectionId)
  if (isCurrentlyOpen) {
    section.classList.add(sectionHiddenClass)
  } else {
    section.classList.remove(sectionHiddenClass)
  }
}

function openAllButtonClicked(e) {
  e.preventDefault()
  sections.forEach(section => section.classList.remove(sectionHiddenClass))
  openCloseButtons.forEach(button => toggleButton(button, 'open'))
  openAllButton.setAttribute('aria-expanded', 'true')
}

function addPredictorTimelineListeners() {
  openCloseButtons.forEach(button =>
    button.addEventListener('click', openCloseButtonClick)
  )
  if (openAllButton) {
    openAllButton.addEventListener('click', openAllButtonClicked)
  }
}

addPredictorTimelineListeners()
