import { randomUUID } from 'node:crypto'
import { mockNext, mockReq, mockRes } from '../../../middleware/testutils/mockRequestUtils'
import { getRecommendation, searchForPrisonOffender, updateRecommendation } from '../../../data/makeDecisionApiClient'
import checkBookingDetailsController from './checkBookingDetailsController'
import recommendationApiResponse from '../../../../api/responses/get-recommendation.json'
import { formatDateTimeFromIsoString } from '../../../utils/dates/format'
import { determinePpudEstablishment } from './determinePpudEstablishment'
import { randomEnum } from '../../../@types/enum.testFactory'
import { CUSTODY_GROUP } from '../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { getRoute } from './custodyGroupRouter'

jest.mock('../../../data/makeDecisionApiClient')
jest.mock('../../../utils/dates/format')
jest.mock('./determinePpudEstablishment')
jest.mock('./custodyGroupRouter')

const prisonOffenderFirstName = 'ANNE'
const prisonOffenderMiddleName = 'C'
const prisonOffenderLastName = 'McCaffrey'

// We only want to convert if the name is in all caps for now
const convertedFirstName = 'Anne'
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
  agencyId: 'KLN',
  agencyDescription: 'The Kyln',
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
    establishment: 'Blackgate Penitentiary',
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
    const expectedCurrentEstablishment = 'The Kyln in PPUD'
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

    expect(determinePpudEstablishment).toHaveBeenCalledWith(
      {
        ...RECOMMENDATION_TEMPLATE,
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
    const custodyGroup = randomEnum(CUSTODY_GROUP)
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        dateOfBirth: '1970-03-15',
        decisionDateTime: '2023-11-13T09:49:31',
        firstNames: 'Anne C',
        lastName: 'McCaffrey',
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
        releasingPrison: 'traitors gate',
        mappaLevel: '1',
        policeForce: 'kent',
        legislationReleasedUnder: 'c 2008',
        probationArea: 'camden',
        currentEstablishment: 'The Kyln in PPUD',
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
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
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
        firstNames: 'Anne C',
        lastName: 'McCaffrey',
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
        name: 'legislationReleasedUnder',
        text: 'Enter legislation',
        invalidParts: undefined,
        values: undefined,
      },
      {
        errorId: 'missingCustodyGroup',
        href: '#custodyGroup',
        name: 'custodyGroup',
        text: 'Select a determinate/indeterminate value',
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
