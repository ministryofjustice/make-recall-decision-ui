import { exactMatchIgnoreWhitespace } from './utils'

Cypress.Commands.add('pageHeading', () =>
  cy
    .get('h1')
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Commands.add('fillInput', (label, text, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('label', label)
    .invoke('attr', 'for')
    .then(id =>
      cy
        .get(`#${id}`)
        .then($input =>
          opts.clearExistingText ? cy.wrap($input).clear({ force: true }).type(text) : cy.wrap($input).type(text)
        )
    )
})

Cypress.Commands.add('getTaskStatus', (taskName, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('li', taskName)
    .find('span>strong')
    .invoke('text')
    .then(text => text.trim())
})

const clickElement = (label, tagName, opts) => {
  const parent = opts?.parent || 'body'
  if (label.qaAttr) {
    cy.get(parent).find(`${tagName}[data-qa="${label.qaAttr}"]`).click()
  } else {
    cy.get(parent).find(tagName).contains(label).click()
  }
}

Cypress.Commands.add('clickButton', (label, opts = { parent: 'body' }) => clickElement(label, 'button', opts))

Cypress.Commands.add('clickLink', (label, opts = { parent: 'body' }) => {
  clickElement(label, 'a', opts)
})

Cypress.Commands.add('getElement', (selector, opts = { parent: 'body' }) =>
  (selector as Cypress.Selector).qaAttr
    ? cy.get(`[data-qa="${(selector as Cypress.Selector).qaAttr}"]`)
    : cy.get(opts.parent).contains(selector as string)
)

Cypress.Commands.add('getLinkHref', (selector, opts = { parent: 'body' }) =>
  cy.getElement(selector as string, opts).invoke('attr', 'href')
)

Cypress.Commands.add('getRowValuesFromTable', ({ tableCaption, rowQaAttr, firstColValue }, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .contains('caption', tableCaption)
    .parent('table')
    .then($table => {
      if (rowQaAttr) {
        return cy.wrap($table).find(`[data-qa="${rowQaAttr}"]`).find('.govuk-table__cell')
      }
      if (firstColValue) {
        return cy
          .wrap($table)
          .contains(exactMatchIgnoreWhitespace(firstColValue))
          .parent('tr')
          .find('.govuk-table__cell')
      }
    })
    .then($els => Cypress.$.makeArray($els).map(el => el.innerText.trim()))
)

Cypress.Commands.add('getText', (qaAttr, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .find(`[data-qa="${qaAttr}"]`)
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Commands.add('getDefinitionListValue', (label: string, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent)
    .find('.govuk-summary-list__key')
    .contains(label)
    .next('.govuk-summary-list__value')
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Commands.add('getListLabels', (labelQaAttr: string, opts = { parent: 'body' }) =>
  cy.getElement({ qaAttr: labelQaAttr }, opts).then($els => Cypress.$.makeArray($els).map(el => el.innerText.trim()))
)

Cypress.Commands.add('assertErrorMessage', ({ fieldGroupId, fieldName, errorText }) => {
  cy.get(`[href="#${fieldGroupId || fieldName}"]`).should('have.text', errorText)
  cy.get(`#${fieldName}-error`)
    .invoke('text')
    .then(text => expect(text.trim()).to.contain(errorText))
})

Cypress.Commands.add('getTextInputValue', (label, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('label', label)
    .invoke('attr', 'for')
    .then(id => cy.get(`#${id}`))
    .invoke('val')
    .then(textVal => (textVal as string).trim())
})

Cypress.Commands.add('viewDetails', (summaryLabel, opts = { parent: 'body' }) => {
  cy.get(opts.parent).contains(summaryLabel).click()
  return cy
    .get(opts.parent)
    .contains(summaryLabel as string)
    .parent('.govuk-details__summary')
    .next('.govuk-details__text')
    .invoke('text')
    .then(text => text.trim())
})

Cypress.Commands.add('isDetailsOpen', (summaryLabel, opts = { parent: 'body' }) => {
  return cy
    .get(opts.parent)
    .contains(summaryLabel as string)
    .parents('.govuk-details')
    .invoke('attr', 'open')
    .then(openAttr => Boolean(openAttr))
})

Cypress.Commands.add('enterDateTime', (parts, opts = { parent: '#main-content' }) => {
  const { day, month, year, hour, minute } = parts
  const options = { ...opts, clearExistingText: true }
  cy.fillInput('Day', day, options)
  cy.fillInput('Month', month, options)
  cy.fillInput('Year', year, options)
  if (hour && minute) {
    cy.fillInput('Hours', hour, options)
    cy.fillInput('Minutes', minute, options)
  }
})

Cypress.Commands.add('selectCheckboxes', (groupLabel, values, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset => {
      values.forEach(value => cy.wrap($fieldset).contains('label', value).click())
    })
})

Cypress.Commands.add('selectCheckboxesByValue', (groupLabel, values, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset => {
      values.forEach(value => cy.wrap($fieldset).get(`input[value='${value}']`).click())
    })
})

Cypress.Commands.add('contactTypeFiltersTotalCount', () => {
  return cy.getElement({ qaAttr: 'contact-count' }).then($els =>
    Cypress.$.makeArray($els)
      .map(el => parseInt(el.innerText.trim(), 10))
      .reduce((sum, current) => {
        return sum + current
      }, 0)
  )
})

// ============================ RADIO BUTTONS ===============================

Cypress.Commands.add('selectRadio', (groupLabel, value, opts = { parent: 'body' }) => {
  cy.get(opts.parent)
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset => {
      cy.wrap($fieldset).contains('label', value).click()
    })
})
Cypress.Commands.add('selectRadioByValue', (groupLabel, value, opts = { parent: 'body' }) => {
  cy.get(opts.parent)
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset => {
      cy.wrap($fieldset).get(`input[value='${value}']`).click()
    })
})

Cypress.Commands.add('getSelectableOptionByLabel', (groupLabel, value, opts = {}) => {
  return cy
    .get(opts.parent || 'body')
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset =>
      cy
        .wrap($fieldset)
        .contains('label', value)
        .invoke('attr', 'for')
        .then(id => cy.get(`#${id}`))
    )
})

Cypress.Commands.add('downloadFile', linkText => {
  return cy.contains('a', linkText).then($link => {
    const url = $link.attr('href')
    return cy.request({
      url,
      encoding: 'base64',
      gzip: false,
    })
  })
})

Cypress.Commands.add('downloadPdf', linkText =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cy.downloadFile(linkText).then(response => cy.task('readPdf', response.body).then(pdf => pdf.text))
)

Cypress.Commands.add(
  'downloadDocX',
  linkText =>
    cy
      .downloadFile(linkText)
      .then(response => cy.task('readDocX', response.body))
      .then(({ value }) => value.replace(/[\r\n]/gm, '')) // strip line breaks
)

Cypress.Commands.add('readBase64File', fileName => {
  const filePath = `${Cypress.config('fixturesFolder')}/${fileName}`
  return cy.task('readBase64File', filePath)
})

Cypress.Commands.add('interceptGoogleAnalyticsEvent', (query, id) => {
  cy.intercept(
    {
      method: 'GET',
      url: 'https://www.google-analytics.com/collect?*',
      query: {
        t: 'event',
        ...query,
      },
    },
    { statusCode: 200 }
  ).as(id)
})

Cypress.Commands.add('getDateAttribute', propertyName =>
  cy.getElement({ qaAttr: propertyName }).invoke('attr', 'data-date')
)

Cypress.Commands.add('getTextFromClipboard', () =>
  cy
    .window()
    .its('navigator.clipboard')
    .invoke('readText')
    .then(text => text)
)

Cypress.Commands.add('logPageTitle', pageTitle => cy.log(`On page "${pageTitle}"`))
