import reviewPractitionersConcernsController from './reviewPractitionersConcernsController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: { name: 'Joe Bloggs' },
          crn: 'X123',
          licenceConditionsBreached: {
            standardLicenceConditions: {
              selected: ['GOOD_BEHAVIOUR', 'NO_OFFENCE', 'KEEP_IN_TOUCH'],
              allOptions: [
                {
                  value: 'GOOD_BEHAVIOUR',
                  text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period',
                },
                { value: 'NO_OFFENCE', text: 'Not commit any offence' },
                {
                  value: 'KEEP_IN_TOUCH',
                  text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer',
                },
              ],
            },
            additionalLicenceConditions: {
              selected: null,
              selectedOptions: [{ mainCatCode: 'NLC8', subCatCode: 'NSTT8' }],
              allOptions: [
                {
                  subCatCode: 'NSTT8',
                  mainCatCode: 'NLC8',
                  title: 'Freedom of movement',
                  details:
                    'To only attend places of worship which have been previously agreed with your supervising officer.',
                  note: null,
                },
              ],
            },
          },
          additionalLicenceConditionsText: 'test 1 2 3',
          alternativesToRecallTried: {
            selected: [
              {
                value: 'WARNINGS_LETTER',
                details: 'some details A',
              },
              {
                value: 'EXTRA_LICENCE_CONDITIONS',
                details: 'some details B',
              },
            ],
            allOptions: [
              {
                value: 'WARNINGS_LETTER',
                text: 'Warnings / licence breach letters',
              },
              {
                value: 'EXTRA_LICENCE_CONDITIONS',
                text: 'Additional licence conditions',
              },
            ],
          },
        },
      },
    })
    const next = mockNext()
    await reviewPractitionersConcernsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'reviewPractitionersConcerns' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/reviewPractitionersConcerns')

    expect(res.locals.offenderName).toEqual('Joe Bloggs')
    expect(res.locals.triggerLeadingToRecall).toBeUndefined()
    expect(res.locals.responseToProbation).toBeUndefined()
    expect(res.locals.standardLicenceConditions).toEqual([
      'Be of good behaviour and not behave in a way which undermines the purpose of the licence period',
      'Not commit any offence',
      'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer',
    ])
    expect(res.locals.additionalLicenceConditions).toEqual([
      {
        details: 'To only attend places of worship which have been previously agreed with your supervising officer.',
        note: null,
        title: 'Freedom of movement',
      },
    ])
    expect(res.locals.alternativesToRecallTried).toEqual([
      {
        details: 'some details A',
        text: 'Warnings / licence breach letters',
        value: 'WARNINGS_LETTER',
      },
      {
        details: 'some details B',
        text: 'Additional licence conditions',
        value: 'EXTRA_LICENCE_CONDITIONS',
      },
    ])
    expect(res.locals.additionalLicenceConditionsText).toEqual('test 1 2 3')
    expect(res.locals.isIndeterminateSentence).toEqual('No')
    expect(res.locals.isExtendedSentence).toEqual('No')

    expect(next).toHaveBeenCalled()
  })

  it('load Delius Data with bad references', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: { name: 'Joe Bloggs' },
          crn: 'X123',
          licenceConditionsBreached: {
            standardLicenceConditions: {
              selected: ['bad', 'bad', 'bad'],
              allOptions: [
                {
                  value: 'GOOD_BEHAVIOUR',
                  text: 'Be of good behaviour and not behave in a way which undermines the purpose of the licence period',
                },
                { value: 'NO_OFFENCE', text: 'Not commit any offence' },
                {
                  value: 'KEEP_IN_TOUCH',
                  text: 'Keep in touch with the supervising officer in accordance with instructions given by the supervising officer',
                },
              ],
            },
            additionalLicenceConditions: {
              selected: null,
              selectedOptions: [{ mainCatCode: 'bad', subCatCode: 'bad' }],
              allOptions: [
                {
                  subCatCode: 'NSTT8',
                  mainCatCode: 'NLC8',
                  title: 'Freedom of movement',
                  details:
                    'To only attend places of worship which have been previously agreed with your supervising officer.',
                  note: null,
                },
              ],
            },
          },
          alternativesToRecallTried: {
            selected: [
              {
                value: 'bad',
                details: 'some details A',
              },
              {
                value: 'bad',
                details: 'some details B',
              },
            ],
            allOptions: [
              {
                value: 'WARNINGS_LETTER',
                text: 'Warnings / licence breach letters',
              },
              {
                value: 'EXTRA_LICENCE_CONDITIONS',
                text: 'Additional licence conditions',
              },
            ],
          },
        },
      },
    })
    const next = mockNext()
    await reviewPractitionersConcernsController.get(mockReq(), res, next)

    expect(res.locals.standardLicenceConditions).toEqual([])
    expect(res.locals.additionalLicenceConditions).toEqual([])
    expect(res.locals.alternativesToRecallTried).toEqual([])
  })

  it('load 2, some variation of data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          isIndeterminateSentence: true,
          isExtendedSentence: true,
          triggerLeadingToRecall: 'some reason 1',
          responseToProbation: 'some reason 2',
          personOnProbation: { name: 'Joe Bloggs' },
          crn: 'X123',
          licenceConditionsBreached: {
            standardLicenceConditions: {
              selected: [],
              allOptions: [],
            },
            additionalLicenceConditions: {
              selectedOptions: [{ mainCatCode: 'NLC8', subCatCode: 'NSTT8' }],
              allOptions: [
                {
                  subCatCode: 'NSTT8',
                  mainCatCode: 'NLC8',
                  title: 'Freedom of movement',
                  details:
                    'To only attend places of worship which have been previously agreed with your supervising officer.',
                  note: 'some note',
                },
              ],
            },
          },
          alternativesToRecallTried: {
            selected: [],
            allOptions: [],
          },
        },
      },
    })
    const next = mockNext()
    await reviewPractitionersConcernsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'reviewPractitionersConcerns' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/reviewPractitionersConcerns')

    expect(res.locals.offenderName).toEqual('Joe Bloggs')
    expect(res.locals.triggerLeadingToRecall).toEqual('some reason 1')
    expect(res.locals.responseToProbation).toEqual('some reason 2')
    expect(res.locals.standardLicenceConditions).toEqual([])
    expect(res.locals.additionalLicenceConditions).toEqual([
      {
        details: 'To only attend places of worship which have been previously agreed with your supervising officer.',
        note: 'some note',
        title: 'Freedom of movement',
      },
    ])
    expect(res.locals.alternativesToRecallTried).toEqual([])
    expect(res.locals.isIndeterminateSentence).toEqual('Yes')
    expect(res.locals.isExtendedSentence).toEqual('Yes')

    expect(next).toHaveBeenCalled()
  })

  it('load cvl data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: { name: 'Joe Bloggs' },
          crn: 'X123',
          licenceConditionsBreached: null,
          cvlLicenceConditionsBreached: {
            standardLicenceConditions: {
              selected: ['9ce9d594-e346-4785-9642-c87e764bee37'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee37',
                  text: 'This is a standard licence condition',
                },
              ],
            },
            additionalLicenceConditions: {
              selected: ['9ce9d594-e346-4785-9642-c87e764bee42'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee42',
                  text: 'This is an additional licence condition',
                },
              ],
            },
            bespokeLicenceConditions: {
              selected: ['9ce9d594-e346-4785-9642-c87e764bee43'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee43',
                  text: 'This is a bespoke licence condition',
                },
              ],
            },
          },
          alternativesToRecallTried: {
            selected: [
              {
                value: 'WARNINGS_LETTER',
                details: 'some details A',
              },
              {
                value: 'EXTRA_LICENCE_CONDITIONS',
                details: 'some details B',
              },
            ],
            allOptions: [
              {
                value: 'WARNINGS_LETTER',
                text: 'Warnings / licence breach letters',
              },
              {
                value: 'EXTRA_LICENCE_CONDITIONS',
                text: 'Additional licence conditions',
              },
            ],
          },
        },
      },
    })
    const next = mockNext()
    await reviewPractitionersConcernsController.get(mockReq(), res, next)

    expect(res.locals.standardLicenceConditions).toEqual(['This is a standard licence condition'])
    expect(res.locals.additionalLicenceConditions).toEqual([
      {
        title: 'This is an additional licence condition',
      },
    ])
    expect(res.locals.bespokeLicenceConditions).toEqual(['This is a bespoke licence condition'])
  })
  it('load cvl bad data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: { name: 'Joe Bloggs' },
          crn: 'X123',
          licenceConditionsBreached: null,
          cvlLicenceConditionsBreached: {
            standardLicenceConditions: {
              selected: ['bad'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee37',
                  text: 'This is a standard licence condition',
                },
              ],
            },
            additionalLicenceConditions: {
              selected: ['bad'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee42',
                  text: 'This is an additional licence condition',
                },
              ],
            },
            bespokeLicenceConditions: {
              selected: ['bad'],
              allOptions: [
                {
                  code: '9ce9d594-e346-4785-9642-c87e764bee43',
                  text: 'This is a bespoke licence condition',
                },
              ],
            },
          },
          alternativesToRecallTried: {
            selected: [
              {
                value: 'WARNINGS_LETTER',
                details: 'some details A',
              },
              {
                value: 'EXTRA_LICENCE_CONDITIONS',
                details: 'some details B',
              },
            ],
            allOptions: [
              {
                value: 'WARNINGS_LETTER',
                text: 'Warnings / licence breach letters',
              },
              {
                value: 'EXTRA_LICENCE_CONDITIONS',
                text: 'Additional licence conditions',
              },
            ],
          },
        },
      },
    })
    const next = mockNext()
    await reviewPractitionersConcernsController.get(mockReq(), res, next)

    expect(res.locals.standardLicenceConditions).toEqual([])
    expect(res.locals.additionalLicenceConditions).toEqual([])
    expect(res.locals.bespokeLicenceConditions).toEqual([])
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()

    await reviewPractitionersConcernsController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        reviewPractitionersConcerns: true,
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/spo-task-list-consider-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
