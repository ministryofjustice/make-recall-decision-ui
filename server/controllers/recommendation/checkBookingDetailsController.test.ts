import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, searchForPrisonOffender, updateRecommendation } from '../../data/makeDecisionApiClient'
import checkBookingDetailsController, { currentHighestRosh } from './checkBookingDetailsController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

const PRISON_OFFENDER_TEMPLATE = {
  locationDescription: 'Graceland',
  bookingNo: '1234',
  firstName: 'Anne',
  middleName: 'C',
  lastName: 'McCaffrey',
  facialImageId: 1234,
  dateOfBirth: '1970-03-15',
  status: 'ACTIVE IN',
  physicalAttributes: {
    gender: 'Male',
    ethnicity: 'Caucasian',
  },
  identifiers: [
    {
      type: 'CRO',
      value: '1234/2345',
    },
    {
      type: 'PNC',
      value: 'X234547',
    },
  ],
}

const RECOMMENDATION_TEMPLATE = {
  id: '123',
  personOnProbation: {
    croNumber: '123X',
    nomsNumber: '567Y',
    surname: 'Mayer',
    dateOfBirth: '2001-01-01',
    mappa: {
      level: '1',
    },
  },
  ppudOffender: {
    ethnicity: 'Caucasian',
    gender: 'Male',
    firstNames: 'Robert Tate',
    familyName: 'Harrison',
    dateOfBirth: '1971-02-03',
    prisonNumber: '12345678',
  },
  whoCompletedPartA: {
    localDeliveryUnit: 'who-completed-delivery-unit',
    isPersonProbationPractitionerForOffender: false,
  },
  practitionerForPartA: {
    localDeliveryUnit: 'practitioner-delivery-unit',
  },
}

const STATUSES_TEMPLATE = [
  {
    name: 'SPO_SIGNED',
    active: true,
    created: '2023-11-13T09:49:31.361Z',
  },
  {
    name: 'ACO_SIGNED',
    active: true,
    created: '2023-11-13T09:49:31.361Z',
  },
  {
    name: 'PO_RECALL_CONSULT_SPO',
    active: true,
    created: '2023-11-13T09:49:31.361Z',
  },
]

describe('get', () => {
  it('load', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: RECOMMENDATION_TEMPLATE,
        statuses: STATUSES_TEMPLATE,
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()

    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(searchForPrisonOffender).toHaveBeenCalledWith('token', '567Y')

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: { xyz: 1 },
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        prisonOffender: {
          cro: '1234/2345',
          pnc: 'X234547',
          bookingNo: '1234',
          firstName: 'Anne',
          middleName: 'C',
          lastName: 'McCaffrey',
          dateOfBirth: '1970-03-15',
          ethnicity: 'Caucasian',
          facialImageId: 1234,
          status: 'ACTIVE IN',
          gender: 'Male',
          locationDescription: 'Graceland',
        },
        bookRecallToPpud: {
          dateOfBirth: '1970-03-15',
          decisionDateTime: '2023-11-13T09:49:31',
          firstNames: 'Anne C',
          lastName: 'McCaffrey',
          cro: '1234/2345',
          isInCustody: true,
          prisonNumber: '1234',
          receivedDateTime: '2023-11-13T09:49:31',
          releaseDate: null,
          riskOfContrabandDetails: '',
          riskOfSeriousHarmLevel: undefined,
          sentenceDate: null,
          image: undefined,
        },
      },
    })

    expect(res.locals.page.id).toEqual('checkBookingDetails')
    expect(res.locals.recommendation.prisonOffender).toEqual({
      cro: '1234/2345',
      pnc: 'X234547',
      bookingNo: '1234',
      firstName: 'Anne',
      middleName: 'C',
      lastName: 'McCaffrey',
      dateOfBirth: '1970-03-15',
      ethnicity: 'Caucasian',
      facialImageId: 1234,
      status: 'ACTIVE IN',
      gender: 'Male',
      locationDescription: 'Graceland',
    })
    expect(res.locals.spoSigned).toEqual({
      name: 'SPO_SIGNED',
      active: true,
      created: '2023-11-13T09:49:31.361Z',
    })
    expect(res.locals.acoSigned).toEqual({
      name: 'ACO_SIGNED',
      active: true,
      created: '2023-11-13T09:49:31.361Z',
    })
    expect(res.locals.poRecallConsultSpo).toEqual({
      name: 'PO_RECALL_CONSULT_SPO',
      active: true,
      created: '2023-11-13T09:49:31.361Z',
    })
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/checkBookingDetails`)

    expect(res.locals.warnings).toStrictEqual({
      'PPUD-Date of birth': '3 February 1971',
      'PPUD-First name': 'Robert Tate',
      'PPUD-Last name': 'Harrison',
      'PPUD-Prison booking number': '12345678',
    })
    expect(next).toHaveBeenCalled()
  })

  it('do not update recommendation if bookRecallToPpud is present', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          bookRecallToPpud: {},
          prisonOffender: {},
        },
        statuses: STATUSES_TEMPLATE,
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()

    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(updateRecommendation).not.toHaveBeenCalled()
  })

  it('show edits', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          bookRecallToPpud: {
            firstNames: 'Ted',
            lastName: 'Cunningham',
            dateOfBirth: '2000-01-01',
            prisonNumber: '1234',
          },
          prisonOffender: {
            firstName: 'Teddy',
            middleName: '',
            lastName: 'Todsworth',
            dateOfBirth: '2000-01-02',
            bookingNo: '123',
          },
        },
        statuses: STATUSES_TEMPLATE,
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()

    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(res.locals.edited).toStrictEqual({
      firstNames: true,
      lastName: true,
      dateOfBirth: true,
      prisonNumber: true,
    })
  })

  it('do not show edits', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          bookRecallToPpud: {
            firstNames: 'Ted Trouble',
            lastName: 'Todsworth',
            dateOfBirth: '2000-01-01',
            prisonNumber: '1234',
          },
          prisonOffender: {
            firstName: 'Ted',
            middleName: 'Trouble',
            lastName: 'Todsworth',
            dateOfBirth: '2000-01-01',
            bookingNo: '1234',
          },
        },
        statuses: STATUSES_TEMPLATE,
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()

    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(res.locals.edited).toStrictEqual({})
  })

  it('load present blanks and banner for no nomis record found.', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(undefined)

    const res = mockRes({
      locals: {
        urlInfo: { basePath: `/recommendations/123/` },
        recommendation: {
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: '567Y',
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
            mappa: {
              level: '1',
            },
          },
          bookRecallToPpud: {},
          whoCompletedPartA: {
            localDeliveryUnit: 'who-completed-delivery-unit',
            isPersonProbationPractitionerForOffender: true,
          },
          practitionerForPartA: {
            localDeliveryUnit: 'practitioner-delivery-unit',
          },
        },
        statuses: [
          {
            name: 'SPO_SIGNED',
            active: true,
            created: '2023-11-13T09:49:31.361Z',
          },
        ],
      },
    })
    const next = mockNext()
    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(res.locals.recommendation.prisonOffender).toEqual(undefined)

    expect(res.locals.errorMessage).toEqual('No NOMIS record found')
    expect(updateRecommendation).not.toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/checkBookingDetails`)
    expect(next).toHaveBeenCalled()
  })
  it('load present blanks and banner for nomis number.', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(undefined)

    const res = mockRes({
      locals: {
        urlInfo: { basePath: `/recommendations/123/` },
        recommendation: {
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: undefined,
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
            mappa: {
              level: '1',
            },
          },
          bookRecallToPpud: {},
          whoCompletedPartA: {
            localDeliveryUnit: 'who-completed-delivery-unit',
            isPersonProbationPractitionerForOffender: true,
          },
          practitionerForPartA: {
            localDeliveryUnit: 'practitioner-delivery-unit',
          },
        },
        statuses: [
          {
            name: 'SPO_SIGNED',
            active: true,
            created: '2023-11-13T09:49:31.361Z',
          },
        ],
      },
    })
    const next = mockNext()
    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(res.locals.recommendation.prisonOffender).toEqual(undefined)

    expect(res.locals.errorMessage).toEqual("No NOMIS number found in 'Consider a recall'")
    expect(searchForPrisonOffender).not.toHaveBeenCalled()
    expect(updateRecommendation).not.toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/checkBookingDetails`)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('book in ppud', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        dateOfBirth: '1970-03-15',
        decisionDateTime: '2023-11-13T09:49:31',
        firstNames: 'Anne C',
        lastName: 'McCaffrey',
        cro: '1234/2345',
        isInCustody: true,
        prisonNumber: '1234',
        receivedDateTime: '2023-11-13T09:49:31',
        releaseDate: null,
        riskOfContrabandDetails: '',
        riskOfSeriousHarmLevel: undefined,
        sentenceDate: null,
        image: undefined,
        gender: 'm',
        ethnicity: 'caucasian',
        custodyType: 'extended',
        releasingPrison: 'traitors gate',
        mappaLevel: '1',
        policeForce: 'kent',
        legislationReleasedUnder: 'c 2008',
        probationArea: 'camden',
      },
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await checkBookingDetailsController.post(req, res, next)

    expect(req.session.errors).toBeUndefined()
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/select-index-offence`)

    expect(next).toHaveBeenCalled()
  })
  it('validation errors', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        dateOfBirth: '1970-03-15',
        decisionDateTime: '2023-11-13T09:49:31',
        firstNames: 'Anne C',
        lastName: 'McCaffrey',
        cro: '1234/2345',
        isInCustody: true,
        prisonNumber: '1234',
        receivedDateTime: '2023-11-13T09:49:31',
        releaseDate: null,
        riskOfContrabandDetails: '',
        riskOfSeriousHarmLevel: undefined,
        sentenceDate: null,
        image: undefined,
      },
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await checkBookingDetailsController.post(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)

    expect(req.session.errors).toStrictEqual([
      {
        errorId: 'missingGender',
        href: '#gender',
        name: 'gender',
        text: 'Select gender',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingEthnicity',
        href: '#ethnicity',
        name: 'ethnicity',
        text: 'Select ethnicity',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingLegislationReleasedUnder',
        href: '#legislationReleasedUnder',
        name: 'legislationReleasedUnder',
        text: 'Select legislation',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingCustodyType',
        href: '#custodyType',
        name: 'custodyType',
        text: 'Select custody type',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingProbationArea',
        href: '#probationArea',
        name: 'probationArea',
        text: 'Select probation area',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingPoliceForce',
        href: '#policeForce',
        name: 'policeForce',
        text: 'Select police force',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingReleasingPrison',
        href: '#releasingPrison',
        name: 'releasingPrison',
        text: 'Select releasing prison',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingMappaLevel',
        href: '#mappaLevel',
        name: 'mappaLevel',
        text: 'Select MAPPA level',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(next).not.toHaveBeenCalled()
  })
})

describe('rosh', () => {
  it('mappings', async () => {
    expect(currentHighestRosh(undefined)).toEqual(undefined)

    expect(currentHighestRosh(null)).toEqual(undefined)

    expect(
      currentHighestRosh({
        riskToPrisoners: 'HIGH',
        riskToPublic: 'LOW',
        riskToStaff: 'MEDIUM',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'MEDIUM',
      })
    ).toEqual('High')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'LOW',
        riskToStaff: 'VERY_HIGH',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'MEDIUM',
      })
    ).toEqual('VeryHigh')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'MEDIUM',
        riskToStaff: 'LOW',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'LOW',
      })
    ).toEqual('Medium')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'LOW',
        riskToPublic: 'LOW',
        riskToStaff: 'LOW',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'LOW',
      })
    ).toEqual('Low')

    expect(
      currentHighestRosh({
        riskToPrisoners: 'NOT_APPLICABLE',
        riskToPublic: 'NOT_APPLICABLE',
        riskToStaff: 'NOT_APPLICABLE',
        riskToKnownAdult: 'NOT_APPLICABLE',
        riskToChildren: 'NOT_APPLICABLE',
      })
    ).toEqual('Not Applicable')
  })
})
