export const setDateInput = (inputId: string, day?: number, month?: number, year?: number) => {
  const setInput = (suffix: string, value?: number) => {
    cy.get(`#${inputId}-${suffix}`).clear()
    if (value) {
      cy.get(`#${inputId}-${suffix}`).type(value.toString())
    }
  }
  setInput('day', day)
  setInput('month', month)
  setInput('year', year)
}

export const verifyInputs = (inputId, day?: number, month?: number, year?: number) => {
  const verifyInput = (suffix: string, value?: number) => {
    cy.get(`#${inputId}-${suffix}`).should('have.value', value ?? '')
  }
  verifyInput('day', day)
  verifyInput('month', month)
  verifyInput('year', year)
}
