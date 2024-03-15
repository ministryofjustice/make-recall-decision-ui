import { validateDateTime } from './formValidator'

describe('validateDateTime', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'appointment-no-recall',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/appointment-no-recall`,
  }

  it('returns valuesToSave and no errors, and redirects to preview, if valid and other tasks complete', async () => {
    const requestBody = {
      'dateTime-day': '12',
      'dateTime-month': '01',
      'dateTime-year': '2024',
      'dateTime-hour': '11',
      'dateTime-minute': '53',
    }
    const { errors, valuesToSave } = await validateDateTime({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      decisionDateTime: '2024-01-12T11:53:00.000Z',
    })
  })
})
