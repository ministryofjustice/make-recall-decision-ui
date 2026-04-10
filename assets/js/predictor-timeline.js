/* eslint-disable */
const allHidden = true

const openText = 'Open'
const closeText = 'Close'
const openAllText = 'Open all'
const closeAllText = 'Close all'

const toggleAllButton = document.getElementById('predictor-timeline__toggle-all')
const individualToggleButtons = document.getElementsByClassName('predictor-timeline__toggle-section')
const timelineSections = document.getElementsByClassName('predictor-timeline-section')

function attachListenerForToggleSectionButton(button, section, initiallyHidden) {
  button.setAttribute('aria-expanded', !initiallyHidden)

  button.onclick = function (e) {
    e.preventDefault()

    if (button.getAttribute('aria-expanded') === 'false') {
      button.innerText = closeText
      this.setAttribute('aria-label', this.getAttribute('aria-label').replace('View', 'Hide'))
      this.setAttribute('aria-expanded', 'true')
      section.classList.remove('predictor-timeline-section--hidden')
    } else {
      button.innerText = openText
      this.setAttribute('aria-label', this.getAttribute('aria-label').replace('Hide', 'View'))
      this.setAttribute('aria-expanded', 'false')
      section.classList.add('predictor-timeline-section--hidden')
    }

    syncToggleAllButton()
  }
}

function syncToggleAllButton() {
  const allOpen = Array.from(individualToggleButtons).every(btn => btn.getAttribute('aria-expanded') === 'true')

  if (allOpen) {
    toggleAllButton.setAttribute('aria-expanded', 'true')
    toggleAllButton.innerText = closeAllText
  } else {
    toggleAllButton.setAttribute('aria-expanded', 'false')
    toggleAllButton.innerText = openAllText
  }
}

function attachListenerForToggleAllButton(button, sections, individualButtons, initiallyHidden) {
  button.setAttribute('aria-expanded', !initiallyHidden)

  button.onclick = function (e) {
    e.preventDefault()

    let sectionButtons

    if (button.getAttribute('aria-expanded') === 'false') {
      button.innerText = closeAllText
      button.setAttribute('aria-label', 'Close all score history')
      button.setAttribute('aria-expanded', 'true')

      for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove('predictor-timeline-section--hidden')

        individualButtons[i].innerText = closeText
        individualButtons[i].setAttribute(
          'aria-label',
          individualButtons[i].getAttribute('aria-label').replace('View', 'Hide')
        )
        individualButtons[i].setAttribute('aria-expanded', 'true')
      }
    } else {
      button.innerText = openAllText
      button.setAttribute('aria-label', 'Open all score history')
      button.setAttribute('aria-expanded', 'false')

      for (let i = 0; i < sections.length; i++) {
        sections[i].classList.add('predictor-timeline-section--hidden')
        individualButtons[i].innerText = openText
        individualButtons[i].setAttribute(
          'aria-label',
          individualButtons[i].getAttribute('aria-label').replace('Hide', 'View')
        )
        individualButtons[i].setAttribute('aria-expanded', 'false')
      }
    }
  }
}

function addPredictorTimelineListeners() {
  for (let i = 0; i < timelineSections.length; i++) {
    if (allHidden) {
      timelineSections[i].classList.add('predictor-timeline-section--hidden')
    }
    attachListenerForToggleSectionButton(individualToggleButtons[i], timelineSections[i], allHidden)
  }

  attachListenerForToggleAllButton(toggleAllButton, timelineSections, individualToggleButtons, allHidden)
}

;(function () {
  addPredictorTimelineListeners()
})()
