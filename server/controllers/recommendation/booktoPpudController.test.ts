import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import {
  getRecommendation,
  getStatuses,
  ppudCreateOffender,
  ppudCreateRecall,
  ppudUpdateOffence,
  ppudUpdateRelease,
  ppudUpdateSentence,
  updateRecommendation,
  updateStatuses,
} from '../../data/makeDecisionApiClient'
import bookToPpudController, { currentHighestRosh } from './bookToPpudController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const recommendation = {
      crn: 'X1213',
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await bookToPpudController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'bookToPpud' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookToPpud')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post - happy path', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      whoCompletedPartA: {
        name: 'dude',
        email: 'dude@me.com',
        telephone: '123456',
        region: 'region A',
        localDeliveryUnit: 'here',
        isPersonProbationPractitionerForOffender: true,
      },
      bookRecallToPpud: {
        decisionDateTime: '2024-01-29T16:15:39',
        isInCustody: false,
        custodyType: 'Determinate',
        releasingPrison: 'here',
        indexOffence:
          'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
        ppudSentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
        mappaLevel: 'Level 2 - local inter-agency management',
        policeForce: 'NCIS Los Angeles',
        probationArea: 'london',
        recommendedTo: null,
        receivedDateTime: '2024-01-29T16:15:39',
        releaseDate: '2023-11-20',
        riskOfContrabandDetails: '',
        riskOfSeriousHarmLevel: null,
        sentenceDate: '2023-11-16',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Johnny J',
        firstName: null,
        secondName: null,
        lastName: 'Teale',
        dateOfBirth: '1970-03-15',
        cro: '123456/12A',
        prisonNumber: '7878783',
        legislationReleasedUnder: 'CJA 2023',
      },
      nomisIndexOffence: {
        allOptions: [
          {
            offenderChargeId: 3934369,
            sentenceDate: '2016-01-01',
            offenceDate: '2016-01-05',
            licenceExpiryDate: '2018-02-02',
            releaseDate: '2017-03-03',
            sentenceEndDate: '2019-04-04',
            courtDescription: 'court desc',
            terms: [
              {
                days: 1,
                months: 2,
                years: 3,
                code: 'IMP',
              },
            ],
          },
        ],
        selected: 3934369,
      },
    })
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.ACO_SIGNED,
        createdByUserFullName: 'Mr Brightside',
        emailAddress: 'email@me.com',
        active: true,
      },
    ])
    ;(ppudCreateOffender as jest.Mock).mockResolvedValue({ offender: { id: '767', sentence: { id: '444' } } })
    ;(ppudUpdateRelease as jest.Mock).mockResolvedValue({ release: { id: '555' } })

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await bookToPpudController.post(req, res, next)

    expect(ppudCreateOffender).toHaveBeenCalledWith('token', {
      additionalAddresses: [
        {
          line1: '',
          line2: '',
          phoneNumber: '',
          postcode: '',
          premises: '123 Acacia Avenue, Birmingham, B23 1AV',
        },
      ],
      address: {
        line1: 'Newtown',
        line2: 'Northampton',
        phoneNumber: '',
        postcode: 'NN4 6HP',
        premises: '41 Newport Pagnell Rd',
      },
      croNumber: '1234',
      custodyType: 'Determinate',
      dateOfBirth: '1970-03-15',
      dateOfSentence: '2023-11-16',
      ethnicity: 'Irish',
      familyName: 'Teale',
      firstNames: 'Johnny J',
      gender: 'Male',
      indexOffence:
        'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
      isInCustody: false,
      mappaLevel: 'Level 2 - local inter-agency management',
      nomsId: 'A12345',
      prisonNumber: '7878783',
    })

    expect(ppudUpdateSentence).toHaveBeenCalledWith('token', '767', '444', {
      custodyType: 'Determinate',
      mappaLevel: 'Level 2 - local inter-agency management',
      dateOfSentence: '2016-01-01',
      licenceExpiryDate: '2018-02-02',
      releaseDate: '2017-03-03',
      sentenceExpiryDate: '2019-04-04',
      sentencingCourt: 'court desc',
      sentenceLength: {
        partDays: 1,
        partMonths: 2,
        partYears: 3,
      },
    })

    expect(ppudUpdateOffence).toHaveBeenCalledWith('token', '767', '444', {
      indexOffence:
        'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
      dateOfIndexOffence: '2016-01-05',
    })

    expect(ppudUpdateRelease).toHaveBeenCalledWith('token', '767', '444', {
      dateOfRelease: '2017-03-03',
      postRelease: {
        assistantChiefOfficer: {
          faxEmail: 'email@me.com',
          name: 'Mr Brightside',
        },
        offenderManager: {
          faxEmail: 'dude@me.com',
          name: 'dude',
          telephone: '123456',
        },
        probationService: 'london',
        spoc: {
          faxEmail: '',
          name: 'NCIS Los Angeles',
        },
      },
      releasedFrom: 'here',
      releasedUnder: 'CJA 2023',
    })

    expect(ppudCreateRecall).toHaveBeenCalledWith('token', '767', '555', {
      decisionDateTime: '2024-01-29T16:15:39',
      isExtendedSentence: true,
      isInCustody: false,
      mappaLevel: 'Level 2 - local inter-agency management',
      policeForce: 'NCIS Los Angeles',
      probationArea: 'london',
      receivedDateTime: '2024-01-29T16:15:39',
      riskOfContrabandDetails: 'Contraband detail...',
      riskOfSeriousHarmLevel: 'Very High',
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['BOOKED_TO_PPUD', 'REC_CLOSED'],
      deActivate: [],
      recommendationId: '1',
      token: 'token',
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        ppudOffender: {
          croOtherNumber: '1234',
          dateOfBirth: '1970-03-15',
          ethnicity: 'Irish',
          familyName: 'Teale',
          firstNames: 'Johnny J',
          gender: 'Male',
          id: '767',
          immigrationStatus: 'N/A',
          nomsId: 'A12345',
          prisonNumber: '7878783',
          prisonerCategory: 'N/A',
          sentences: [],
          status: 'N/A',
          youngOffender: 'N/A',
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/booked-to-ppud`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post - person not probation practitioner', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      whoCompletedPartA: {
        isPersonProbationPractitionerForOffender: false,
      },
      practitionerForPartA: {
        name: 'dudette',
        email: 'dudette@me.com',
        telephone: '55555',
      },
      bookRecallToPpud: {
        releasingPrison: 'here',
        policeForce: 'NCIS Los Angeles',
        probationArea: 'london',
        legislationReleasedUnder: 'CJA 2023',
      },
      nomisIndexOffence: {
        allOptions: [
          {
            offenderChargeId: 3934369,
            releaseDate: '2017-03-03',
            terms: [],
          },
        ],
        selected: 3934369,
      },
    })
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.ACO_SIGNED,
        createdByUserFullName: 'Mr Brightside',
        emailAddress: 'email@me.com',
        active: true,
      },
    ])
    ;(ppudCreateOffender as jest.Mock).mockResolvedValue({ offender: { id: '767', sentence: { id: '444' } } })
    ;(ppudUpdateRelease as jest.Mock).mockResolvedValue({ release: { id: '555' } })

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await bookToPpudController.post(req, res, next)

    expect(ppudUpdateRelease).toHaveBeenCalledWith('token', '767', '444', {
      dateOfRelease: '2017-03-03',
      postRelease: {
        assistantChiefOfficer: {
          faxEmail: 'email@me.com',
          name: 'Mr Brightside',
        },
        offenderManager: {
          faxEmail: 'dudette@me.com',
          name: 'dudette',
          telephone: '55555',
        },
        probationService: 'london',
        spoc: {
          faxEmail: '',
          name: 'NCIS Los Angeles',
        },
      },
      releasedFrom: 'here',
      releasedUnder: 'CJA 2023',
    })
  })

  it('post - validation error', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      personOnProbation: {
        ...recommendationApiResponse.personOnProbation,
        addresses: [{ noFixedAbode: true }],
      },
    })
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.ACO_SIGNED,
        createdByUserFullName: 'Mr Brightside',
        emailAddress: 'email@me.com',
        active: true,
      },
    ])
    ;(ppudCreateOffender as jest.Mock).mockImplementation(() => {
      throw new HttpError(400)
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath: `/recommendations/1/` },
        flags: { xyz: true },
      },
    })

    await bookToPpudController.post(req, res, mockNext())

    expect(ppudCreateOffender).toHaveBeenCalledWith('token', {
      additionalAddresses: [
        {
          line1: '',
          line2: '',
          phoneNumber: '',
          postcode: '',
          premises: '123 Acacia Avenue, Birmingham, B23 1AV',
        },
      ],
      address: {
        line1: 'No Fixed Abode',
        line2: '',
        postcode: '',
        premises: '',
        phoneNumber: '',
      },
      croNumber: '1234',
      custodyType: undefined,
      dateOfBirth: undefined,
      dateOfSentence: undefined,
      ethnicity: undefined,
      familyName: undefined,
      firstNames: undefined,
      gender: undefined,
      indexOffence: undefined,
      isInCustody: undefined,
      mappaLevel: undefined,
      nomsId: 'A12345',
      prisonNumber: undefined,
    })

    expect(req.session.errors).toStrictEqual([
      {
        errorId: 'ppudBookingError',
        href: '#ppudBooking',
        invalidParts: undefined,
        name: 'ppudBooking',
        text: 'Something went wrong sending the booking to PPUD.  You may have to book this recall manually.',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post - some other error', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      personOnProbation: {
        ...recommendationApiResponse.personOnProbation,
        addresses: [{ noFixedAbode: true }],
      },
    })
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.ACO_SIGNED,
        createdByUserFullName: 'Mr Brightside',
        emailAddress: 'email@me.com',
        active: true,
      },
    ])
    ;(ppudCreateOffender as jest.Mock).mockImplementation(() => {
      throw new Error('I should fail')
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const res = mockRes({
      locals: {
        urlInfo: { basePath: `/recommendations/1/` },
        flags: { xyz: true },
      },
    })

    await expect(bookToPpudController.post(req, res, mockNext())).rejects.toThrow('I should fail')
  })

  it('post - no fixed abode', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      whoCompletedPartA: {
        isPersonProbationPractitionerForOffender: false,
      },
      practitionerForPartA: {
        name: 'dudette',
        email: 'dudette@me.com',
        telephone: '55555',
      },
      bookRecallToPpud: {
        releasingPrison: 'here',
        policeForce: 'NCIS Los Angeles',
        probationArea: 'london',
        legislationReleasedUnder: 'CJA 2023',
      },
      personOnProbation: {
        ...recommendationApiResponse.personOnProbation,
        addresses: [{ noFixedAbode: true }],
      },
      nomisIndexOffence: {
        allOptions: [
          {
            offenderChargeId: 3934369,
            sentenceDate: '2016-01-01',
            licenceExpiryDate: '2018-02-02',
            releaseDate: '2017-03-03',
            sentenceEndDate: '2019-04-04',
            courtDescription: 'court desc',
            terms: [
              {
                days: 1,
                months: 2,
                years: 3,
                code: 'IMP',
              },
            ],
          },
        ],
        selected: 3934369,
      },
    })
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.ACO_SIGNED,
        createdByUserFullName: 'Mr Brightside',
        emailAddress: 'email@me.com',
        active: true,
      },
    ])
    ;(ppudCreateOffender as jest.Mock).mockResolvedValue({ offender: { id: '767', sentence: { id: '444' } } })
    ;(ppudUpdateRelease as jest.Mock).mockResolvedValue({ release: { id: '555' } })

    await bookToPpudController.post(
      mockReq({
        params: { recommendationId: '1' },
      }),
      mockRes({
        locals: {
          urlInfo: { basePath: `/recommendations/1/` },
          flags: { xyz: true },
        },
      }),
      mockNext()
    )

    expect(ppudCreateOffender).toHaveBeenCalledWith('token', {
      additionalAddresses: [
        {
          line1: '',
          line2: '',
          phoneNumber: '',
          postcode: '',
          premises: '123 Acacia Avenue, Birmingham, B23 1AV',
        },
      ],
      address: {
        line1: 'No Fixed Abode',
        line2: '',
        postcode: '',
        premises: '',
        phoneNumber: '',
      },
      croNumber: '1234',
      custodyType: undefined,
      dateOfBirth: undefined,
      dateOfSentence: undefined,
      ethnicity: undefined,
      familyName: undefined,
      firstNames: undefined,
      gender: undefined,
      indexOffence: undefined,
      isInCustody: undefined,
      mappaLevel: undefined,
      nomsId: 'A12345',
      prisonNumber: undefined,
    })
  })
})

class HttpError {
  public status: number

  constructor(status: number) {
    this.status = status
  }
}

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
    ).toEqual('Very High')

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
