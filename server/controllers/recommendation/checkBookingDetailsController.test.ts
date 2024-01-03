import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { searchForPrisonOffender, updateRecommendation } from '../../data/makeDecisionApiClient'
import checkBookingDetailsController, { currentHighestRosh } from './checkBookingDetailsController'

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
          CRO: '1234/2345',
          PNC: 'X234547',
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
          firstName: 'Anne',
          lastName: 'McCaffrey',
          secondName: 'C',
          isInCustody: true,
          mappaLevel: 'Level 1',
          policeForce: 'HARDCODED_VALUE',
          probationArea: 'HARDCODED_VALUE',
          receivedDateTime: '2023-11-13T09:49:31',
          recommendedToOwner: 'HARDCODED_VALUE',
          releaseDate: null,
          riskOfContrabandDetails: '',
          riskOfSeriousHarmLevel: undefined,
          sentenceDate: null,
        },
      },
    })

    expect(res.locals.page.id).toEqual('checkBookingDetails')
    expect(res.locals.prisonOffender).toEqual({
      CRO: '1234/2345',
      PNC: 'X234547',
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
    expect(res.locals.probationArea).toEqual('practitioner-delivery-unit')
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
    expect(next).toHaveBeenCalled()
  })

  it('do not update recommendation if bookRecallToPpud is present', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          bookRecallToPpud: {},
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

  it('load - alternative probation area', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          whoCompletedPartA: {
            localDeliveryUnit: 'who-completed-delivery-unit',
            isPersonProbationPractitionerForOffender: true,
          },
        },
        statuses: STATUSES_TEMPLATE,
      },
    })
    const next = mockNext()
    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(res.locals.probationArea).toEqual('who-completed-delivery-unit')
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

    expect(res.locals.prisonOffender).toEqual({
      CRO: undefined,
      PNC: undefined,
      bookingNo: undefined,
      dateOfBirth: undefined,
      ethnicity: undefined,
      facialImageId: undefined,
      firstName: undefined,
      gender: undefined,
      lastName: undefined,
      locationDescription: undefined,
      middleName: undefined,
      status: undefined,
    })

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

    expect(res.locals.prisonOffender).toEqual({
      CRO: undefined,
      PNC: undefined,
      bookingNo: undefined,
      dateOfBirth: undefined,
      ethnicity: undefined,
      facialImageId: undefined,
      firstName: undefined,
      gender: undefined,
      lastName: undefined,
      locationDescription: undefined,
      middleName: undefined,
      status: undefined,
    })

    expect(res.locals.errorMessage).toEqual("No NOMIS number found in 'Consider a recall'")
    expect(searchForPrisonOffender).not.toHaveBeenCalled()
    expect(updateRecommendation).not.toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/checkBookingDetails`)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('book in ppud', async () => {
    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    const next = mockNext()

    await checkBookingDetailsController.post(mockReq(), res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/select-index-offence`)

    expect(next).toHaveBeenCalled()
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
