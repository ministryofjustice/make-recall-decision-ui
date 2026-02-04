import { randomUUID } from 'node:crypto'
import { mockNext, mockReq, mockRes } from '../../../middleware/testutils/mockRequestUtils'
import { getRecommendation, searchForPrisonOffender, updateRecommendation } from '../../../data/makeDecisionApiClient'
import checkBookingDetailsController from './checkBookingDetailsController'
import recommendationApiResponse from '../../../../api/responses/get-recommendation.json'
import { formatDateTimeFromIsoString } from '../../../utils/dates/formatting'
import { determinePpudEstablishment } from './determinePpudEstablishment'
import { randomEnum } from '../../../@types/enum.testFactory'
import { CUSTODY_GROUP } from '../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { getRoute } from './custodyGroupRouter'

jest.mock('../../../data/makeDecisionApiClient')
jest.mock('../../../utils/dates/formatting')
jest.mock('./determinePpudEstablishment')
jest.mock('./custodyGroupRouter')

const prisonOffenderFirstName = 'JANE'
const prisonOffenderMiddleName = 'C'
const prisonOffenderLastName = 'Doe'

// We only want to convert if the name is in all caps for now
const convertedFirstName = 'Jane'
const convertedMiddleName = prisonOffenderMiddleName
const convertedLastName = prisonOffenderLastName

const PRISON_OFFENDER_TEMPLATE = {
  locationDescription: 'Graceland',
  bookingNo: '1234',
  firstName: prisonOffenderFirstName,
  middleName: prisonOffenderMiddleName,
  lastName: prisonOffenderLastName,
  facialImageId: 1234,
  dateOfBirth: '1970-03-15',
  agencyId: 'BRX',
  agencyDescription: 'HMP Brixton',
  status: 'ACTIVE IN',
  physicalAttributes: {
    gender: 'Male',
    ethnicity: 'White',
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
    surname: 'Doe',
    dateOfBirth: '2001-01-01',
    mappa: {
      level: '1',
    },
  },
  ppudOffender: {
    ethnicity: 'White',
    gender: 'Male',
    firstNames: 'Joe John',
    familyName: 'Bloggs',
    dateOfBirth: '1971-02-03',
    prisonNumber: '12345678',
    establishment: 'HMP Belmarsh',
  },
  whoCompletedPartA: {
    localDeliveryUnit: 'who-completed-delivery-unit',
    isPersonProbationPractitionerForOffender: false,
  },
  practitionerForPartA: {
    localDeliveryUnit: 'practitioner-delivery-unit',
  },
}

const SPO_SIGNED_STATUS_TEMPLATE = {
  name: 'SPO_SIGNED',
  active: true,
  created: '2023-11-13T09:49:31.361Z',
}
const ACO_SIGNED_STATUS_TEMPLATE = {
  name: 'ACO_SIGNED',
  active: true,
  created: '2023-11-13T09:49:31.361Z',
}
const PO_RECALL_CONSULT_SPO_STATUS_TEMPLATE = {
  name: 'PO_RECALL_CONSULT_SPO',
  active: true,
  created: '2023-11-13T09:49:31.361Z',
}
const SENT_TO_PPCS_STATUS_TEMPLATE = {
  name: 'SENT_TO_PPCS',
  active: true,
  created: '2023-11-13T09:49:31.371Z',
}
const AP_RECORDED_RATIONALE = {
  name: 'AP_RECORDED_RATIONALE',
  active: true,
  created: '2023-11-13T09:49:31.371Z',
}
const STATUSES_TEMPLATE = [
  SPO_SIGNED_STATUS_TEMPLATE,
  ACO_SIGNED_STATUS_TEMPLATE,
  PO_RECALL_CONSULT_SPO_STATUS_TEMPLATE,
  SENT_TO_PPCS_STATUS_TEMPLATE,
]

describe('get', () => {
  beforeEach(() => {
    jest.mock('../../../utils/utils', () => ({
      ...jest.requireActual('../../utils/utils'),
      convertToTitleCase: (name: string) => {
        switch (name) {
          case prisonOffenderFirstName:
            return convertedFirstName
          case prisonOffenderMiddleName:
            return convertedMiddleName
          default:
            throw new Error(`convertToTitleCase called with unexpected value: ${name}`)
        }
      },
    }))
  })
  it('load', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)
    const formattedPpudDateOfBirth = 'date'
    ;(formatDateTimeFromIsoString as jest.Mock).mockReturnValueOnce(formattedPpudDateOfBirth)
    const expectedCurrentEstablishment = 'HMP Brixton in PPUD'
    ;(determinePpudEstablishment as jest.Mock).mockReturnValueOnce(expectedCurrentEstablishment)

    const expectedPrisonOffender = {
      cro: PRISON_OFFENDER_TEMPLATE.identifiers[0].value,
      pnc: PRISON_OFFENDER_TEMPLATE.identifiers[1].value,
      bookingNo: PRISON_OFFENDER_TEMPLATE.bookingNo,
      firstName: prisonOffenderFirstName,
      middleName: prisonOffenderMiddleName,
      lastName: prisonOffenderLastName,
      dateOfBirth: PRISON_OFFENDER_TEMPLATE.dateOfBirth,
      agencyId: PRISON_OFFENDER_TEMPLATE.agencyId,
      agencyDescription: PRISON_OFFENDER_TEMPLATE.agencyDescription,
      ethnicity: PRISON_OFFENDER_TEMPLATE.physicalAttributes.ethnicity,
      facialImageId: PRISON_OFFENDER_TEMPLATE.facialImageId,
      status: PRISON_OFFENDER_TEMPLATE.status,
      gender: PRISON_OFFENDER_TEMPLATE.physicalAttributes.gender,
      locationDescription: PRISON_OFFENDER_TEMPLATE.locationDescription,
    }

    const res = mockRes({
      locals: {
        recommendation: { ...RECOMMENDATION_TEMPLATE },
        statuses: [...STATUSES_TEMPLATE],
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()

    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(searchForPrisonOffender).toHaveBeenCalledWith('token', '567Y')

    expect(determinePpudEstablishment).toHaveBeenCalledWith(
      {
        ...RECOMMENDATION_TEMPLATE,
        bookRecallToPpud: {
          cro: '1234/2345',
          currentEstablishment: 'HMP Brixton in PPUD',
          dateOfBirth: '1970-03-15',
          firstNames: 'Jane C',
          lastName: 'Doe',
          prisonNumber: '1234',
          receivedDateTime: '2023-11-13T09:49:31.371Z',
        },
        prisonOffender: expectedPrisonOffender,
      },
      'token'
    )

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: { xyz: 1 },
      recommendationId: RECOMMENDATION_TEMPLATE.id,
      token: 'token',
      valuesToSave: {
        prisonOffender: expectedPrisonOffender,
        bookRecallToPpud: {
          dateOfBirth: PRISON_OFFENDER_TEMPLATE.dateOfBirth,
          firstNames: `${convertedFirstName} ${convertedMiddleName}`,
          lastName: convertedLastName,
          cro: PRISON_OFFENDER_TEMPLATE.identifiers[0].value,
          prisonNumber: PRISON_OFFENDER_TEMPLATE.bookingNo,
          receivedDateTime: SENT_TO_PPCS_STATUS_TEMPLATE.created,
          currentEstablishment: expectedCurrentEstablishment,
          image: undefined,
        },
      },
    })

    expect(res.locals.page.id).toEqual('checkBookingDetails')
    expect(res.locals.recommendation.prisonOffender).toEqual(expectedPrisonOffender)
    expect(res.locals.spoSigned).toEqual(SPO_SIGNED_STATUS_TEMPLATE)
    expect(res.locals.acoSigned).toEqual(ACO_SIGNED_STATUS_TEMPLATE)
    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/checkBookingDetails`)

    expect(res.locals.warnings).toStrictEqual({
      'PPUD-Date of birth': formattedPpudDateOfBirth,
      'PPUD-First name': RECOMMENDATION_TEMPLATE.ppudOffender.firstNames,
      'PPUD-Last name': RECOMMENDATION_TEMPLATE.ppudOffender.familyName,
      'PPUD-Prison booking number': RECOMMENDATION_TEMPLATE.ppudOffender.prisonNumber,
    })
    expect(formatDateTimeFromIsoString).toHaveBeenCalledWith({
      isoDate: RECOMMENDATION_TEMPLATE.ppudOffender.dateOfBirth,
      dateOnly: true,
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
            firstNames: 'Joe',
            lastName: 'Bloggs',
            dateOfBirth: '2000-01-01',
            prisonNumber: '1234',
          },
          prisonOffender: {
            firstName: 'Joseph',
            middleName: '',
            lastName: 'Doe',
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
            firstNames: 'Joe John',
            lastName: 'Bloggs',
            dateOfBirth: '2000-01-01',
            prisonNumber: '1234',
          },
          prisonOffender: {
            firstName: 'Joe',
            middleName: 'John',
            lastName: 'Bloggs',
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
  it('default to determinate custody type if ppud record not found', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)

    const res = mockRes({
      locals: {
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          bookRecallToPpud: {},
          prisonOffender: {},
          ppudOffender: null,
        },
        statuses: STATUSES_TEMPLATE,
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()
    await checkBookingDetailsController.get(mockReq(), res, next)

    // PPUD offender should be unchanged
    expect(res.locals.recommendation.ppudOffender).toEqual(null)
    // Custody group should default to Determinate as we can only create new PPUD records for determinate sentences
    expect(res.locals.recommendation.bookRecallToPpud?.custodyGroup).toEqual(CUSTODY_GROUP.DETERMINATE)
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
            surname: 'Doe',
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

    expect(res.locals.recommendation.prisonOffender).toEqual(undefined)

    expect(res.locals.errorMessage).toEqual('No NOMIS record found')
    expect(updateRecommendation).toHaveBeenCalled()

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
            surname: 'Doe',
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

  it('uses recall decision date and time as recall received date and time when loading an out of hours recall', async () => {
    ;(searchForPrisonOffender as jest.Mock).mockResolvedValue(PRISON_OFFENDER_TEMPLATE)
    const res = mockRes({
      locals: {
        recommendation: {
          ...RECOMMENDATION_TEMPLATE,
          decisionDateTime: '2026-01-01T08:00:00',
        },
        statuses: [...STATUSES_TEMPLATE, AP_RECORDED_RATIONALE],
        flags: {
          xyz: 1,
        },
      },
    })
    const next = mockNext()

    await checkBookingDetailsController.get(mockReq(), res, next)

    expect(updateRecommendation).toHaveBeenCalledWith(
      expect.objectContaining({
        valuesToSave: expect.objectContaining({
          bookRecallToPpud: expect.objectContaining({
            receivedDateTime: '2026-01-01T08:00:00',
          }),
        }),
      })
    )
  })
})

describe('post', () => {
  it('book in ppud', async () => {
    const custodyGroup = randomEnum(CUSTODY_GROUP)
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        dateOfBirth: '1970-03-15',
        decisionDateTime: '2023-11-13T09:49:31',
        firstNames: 'Jane J',
        lastName: 'Bloggs',
        cro: '1234/2345',
        prisonNumber: '1234',
        receivedDateTime: '2023-11-13T09:49:31',
        releaseDate: null,
        riskOfContrabandDetails: '',
        riskOfSeriousHarmLevel: undefined,
        sentenceDate: null,
        image: undefined,
        gender: 'm',
        ethnicity: 'caucasian',
        custodyGroup,
        custodyType: 'extended',
        releasingPrison: 'HMP leeds',
        mappaLevel: '1',
        policeForce: 'kent',
        legislationReleasedUnder: 'c 2008',
        probationArea: 'camden',
        currentEstablishment: 'HMP Brixton in PPUD',
      },
    })

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
    })

    const basePath = `/recommendations/123/`
    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath },
      },
    })

    const next = mockNext()

    const destinationUrl = randomUUID()
    ;(getRoute as jest.Mock).mockReturnValueOnce(destinationUrl)

    await checkBookingDetailsController.post(req, res, next)

    expect(req.session.errors).toBeUndefined()
    expect(getRoute).toHaveBeenCalledWith(custodyGroup)
    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}${destinationUrl}`)

    expect(next).toHaveBeenCalled()
  })
  it('validation errors', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        dateOfBirth: '1970-03-15',
        decisionDateTime: '2023-11-13T09:49:31',
        firstNames: 'Jane J',
        lastName: 'Bloggs',
        cro: '1234/2345',
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
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
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
        text: 'Enter gender',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingEthnicity',
        href: '#ethnicity',
        name: 'ethnicity',
        text: 'Enter ethnicity',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingCustodyGroup',
        href: '#custodyGroup',
        name: 'custodyGroup',
        text: 'Select the correct sentence type',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingCurrentEstablishment',
        href: '#currentEstablishment',
        name: 'currentEstablishment',
        text: 'Select an establishment from the list',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingProbationArea',
        href: '#probationArea',
        name: 'probationArea',
        text: 'Enter probation area',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingPoliceForce',
        href: '#policeForce',
        name: 'policeForce',
        text: 'Enter police force',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingReleasingPrison',
        href: '#releasingPrison',
        name: 'releasingPrison',
        text: 'Select a releasing prison from the list',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingMappaLevel',
        href: '#mappaLevel',
        name: 'mappaLevel',
        text: 'Enter MAPPA level',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(next).not.toHaveBeenCalled()
  })

  it('validates legislation released under when custody group is determinate', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        dateOfBirth: '1970-03-15',
        decisionDateTime: '2023-11-13T09:49:31',
        firstNames: 'Jane J',
        lastName: 'Bloggs',
        cro: '1234/2345',
        prisonNumber: '1234',
        receivedDateTime: '2023-11-13T09:49:31',
        releaseDate: null,
        riskOfContrabandDetails: '',
        riskOfSeriousHarmLevel: undefined,
        sentenceDate: null,
        image: undefined,
        custodyGroup: CUSTODY_GROUP.DETERMINATE,
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
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
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
        text: 'Enter gender',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingEthnicity',
        href: '#ethnicity',
        name: 'ethnicity',
        text: 'Enter ethnicity',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingLegislationReleasedUnder',
        href: '#legislationReleasedUnder',
        invalidParts: undefined,
        name: 'legislationReleasedUnder',
        text: 'Enter legislation',
        values: undefined,
      },
      {
        errorId: 'missingCurrentEstablishment',
        href: '#currentEstablishment',
        name: 'currentEstablishment',
        text: 'Select an establishment from the list',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingProbationArea',
        href: '#probationArea',
        name: 'probationArea',
        text: 'Enter probation area',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingPoliceForce',
        href: '#policeForce',
        name: 'policeForce',
        text: 'Enter police force',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingReleasingPrison',
        href: '#releasingPrison',
        name: 'releasingPrison',
        text: 'Select a releasing prison from the list',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingMappaLevel',
        href: '#mappaLevel',
        name: 'mappaLevel',
        text: 'Enter MAPPA level',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(next).not.toHaveBeenCalled()
  })

  // Indeterminate sentences derive legislationReleasedUnder via the custodyGroup in the PPUD automation API - MRD-2979
  it('does not validate legislation released under when custody group is indeterminate', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        dateOfBirth: '1970-03-15',
        decisionDateTime: '2023-11-13T09:49:31',
        firstNames: 'Jane J',
        lastName: 'Bloggs',
        cro: '1234/2345',
        prisonNumber: '1234',
        receivedDateTime: '2023-11-13T09:49:31',
        releaseDate: null,
        riskOfContrabandDetails: '',
        riskOfSeriousHarmLevel: undefined,
        sentenceDate: null,
        image: undefined,
        custodyGroup: CUSTODY_GROUP.INDETERMINATE,
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
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
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
        text: 'Enter gender',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingEthnicity',
        href: '#ethnicity',
        name: 'ethnicity',
        text: 'Enter ethnicity',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingCurrentEstablishment',
        href: '#currentEstablishment',
        name: 'currentEstablishment',
        text: 'Select an establishment from the list',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingProbationArea',
        href: '#probationArea',
        name: 'probationArea',
        text: 'Enter probation area',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingPoliceForce',
        href: '#policeForce',
        name: 'policeForce',
        text: 'Enter police force',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingReleasingPrison',
        href: '#releasingPrison',
        name: 'releasingPrison',
        text: 'Select a releasing prison from the list',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingMappaLevel',
        href: '#mappaLevel',
        name: 'mappaLevel',
        text: 'Enter MAPPA level',
        invalidParts: undefined,
        values: undefined,
      },
    ])

    expect(next).not.toHaveBeenCalled()
  })
})
