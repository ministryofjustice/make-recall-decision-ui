/* eslint-disable */
var allHidden = true
var openText = 'Open'
var closeText = 'Close'

function attachListenerForToggleSectionButton(button, section, initiallyHidden) {
  button.setAttribute('data-section-is-hidden', initiallyHidden)

  button.onclick = function (e) {
    e.preventDefault()

    var sectionIsHidden = button.dataset.sectionIsHidden === 'true'

    if (sectionIsHidden) {
      button.innerText = closeText
      section.classList.remove('predictor-timeline-section--hidden')
    } else {
      button.innerText = openText
      section.classList.add('predictor-timeline-section--hidden')
    }

    button.setAttribute('data-section-is-hidden', !sectionIsHidden)
  }
}

function attachListenerForToggleAllButton(button, sections) {
  button.setAttribute('data-sections-are-hidden', allHidden)

  button.onclick = function (e) {
    e.preventDefault()

    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.remove('predictor-timeline-section--hidden')

      var openSectionButtons = sections[i].parentElement.getElementsByClassName('predictor-timeline__toggle-section')

      for (var j = 0; j < openSectionButtons.length; j++) {
        openSectionButtons[j].setAttribute('data-section-is-hidden', false)
        openSectionButtons[j].innerText = closeText
      }
    }
  }
}

function addPredictorTimelineListeners() {
  var openAllButton = document.getElementById('predictor-timeline__toggle-all')
  var sections = document.getElementsByClassName('predictor-timeline-section')

  for (var i = 0; i < sections.length; i++) {
    if (allHidden) {
      sections[i].classList.add('predictor-timeline-section--hidden')
    }

    var openSectionButtons = sections[i].parentElement.getElementsByClassName('predictor-timeline__toggle-section')
    for (var j = 0; j < openSectionButtons.length; j++) {
      attachListenerForToggleSectionButton(openSectionButtons[j], sections[i], allHidden)
    }
  }

  if (openAllButton) {
    attachListenerForToggleAllButton(openAllButton, sections)
  }
}

;(function () {
  addPredictorTimelineListeners()
})()
