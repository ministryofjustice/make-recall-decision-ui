/* eslint-disable */
var openText = 'Open';
var closeText = 'Close';
var openAllText = 'Open all';
var closeAllText = 'Close all';

function attachToggleSection(button, section) {
  if (!button || !section) return;

  section.classList.add('predictor-timeline-section--hidden');
  button.setAttribute('data-section-is-hidden', 'true');
  button.innerText = openText;

  button.onclick = function (e) {
    e.preventDefault();
    var isHidden = section.classList.contains('predictor-timeline-section--hidden');

    if (isHidden) {
      section.classList.remove('predictor-timeline-section--hidden');
      button.innerText = closeText;
    } else {
      section.classList.add('predictor-timeline-section--hidden');
      button.innerText = openText;
    }

    button.setAttribute('data-section-is-hidden', String(!isHidden));
    updateOpenAllButton();
  };
}

function updateOpenAllButton() {
  var openAllButton = document.getElementById('predictor-timeline__toggle-all');
  if (!openAllButton) return;

  var collapsibleSections = document.querySelectorAll('.predictor-timeline-section');
  var isAnyHidden = Array.from(collapsibleSections).some(section =>
    section.classList.contains('predictor-timeline-section--hidden')
  );

  openAllButton.innerText = isAnyHidden ? openAllText : closeAllText;
}

function addPredictorTimelineListeners() {
  var sections = document.querySelectorAll('.predictor-timeline-section');

  sections.forEach(function (section) {
    var button = section.parentElement.querySelector('.predictor-timeline__toggle-section');
    attachToggleSection(button, section);
  });

  var openAllButton = document.getElementById('predictor-timeline__toggle-all');
  if (!openAllButton) return;

  openAllButton.onclick = function (e) {
    e.preventDefault();

    var collapsibleSections = document.querySelectorAll('.predictor-timeline-section');
    var isAnyHidden = Array.from(collapsibleSections).some(section =>
      section.classList.contains('predictor-timeline-section--hidden')
    );

    collapsibleSections.forEach(function (section) {
      var button = section.parentElement.querySelector('.predictor-timeline__toggle-section');
      if (!button) return;

      if (isAnyHidden) {
        section.classList.remove('predictor-timeline-section--hidden');
        button.innerText = closeText;
      } else {
        section.classList.add('predictor-timeline-section--hidden');
        button.innerText = openText;
      }

      button.setAttribute('data-section-is-hidden', String(section.classList.contains('predictor-timeline-section--hidden')));
    });

    // Update Open All / Close All
    updateOpenAllButton();
  };

  updateOpenAllButton();
}

document.addEventListener('DOMContentLoaded', addPredictorTimelineListeners);
