import bookOffender from './bookOffender'
import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { ppudCreateOffender, ppudUpdateOffender, updateRecommendation } from '../data/makeDecisionApiClient'

jest.mock('../data/makeDecisionApiClient')

describe('book offender', () => {
  it('happy path - stage has passed', async () => {
    const bookingMomento = {
      stage: StageEnum.OFFENDER_BOOKED,
    }

    const result = await bookOffender(bookingMomento, {}, 'token', { xyz: true })

    expect(ppudCreateOffender).not.toHaveBeenCalled()
    expect(ppudUpdateOffender).not.toHaveBeenCalled()
    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(bookingMomento).toEqual(result)
  })

  it('happy path - create offender', async () => {
    const bookingMomento = {
      stage: StageEnum.STARTED,
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      prisonOffender: {
        status: 'INACTIVE OUT',
      },
      personOnProbation: {
        nomsNumber: 'A12345',
        addresses: [
          {
            line1: '41 Newport Pagnell Rd',
            line2: 'Newtown',
            town: 'Northampton',
            postcode: 'NN4 6HP',
            noFixedAbode: false,
          },
        ],
      },
      isMainAddressWherePersonCanBeFound: {
        selected: false,
        details: '123 Acacia Avenue, Birmingham, B23 1AV',
      },
      bookRecallToPpud: {
        custodyType: 'Determinate',
        indexOffence:
          'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
        mappaLevel: 'Level 2 - local inter-agency management',
        sentenceDate: '2023-11-16',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Johnny J',
        lastName: 'Teale',
        dateOfBirth: '1970-03-15',
        prisonNumber: '7878783',
        cro: '1234',
      },
    } as unknown as RecommendationResponse

    ;(ppudCreateOffender as jest.Mock).mockResolvedValue({ offender: { id: '767', sentence: { id: '444' } } })

    const result = await bookOffender(bookingMomento, recommendation, 'token', { xyz: true })

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

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMomento: {
          offenderId: '767',
          sentenceId: '444',
          stage: 'OFFENDER_BOOKED',
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })
    expect(result).toEqual({
      offenderId: '767',
      sentenceId: '444',
      stage: 'OFFENDER_BOOKED',
    })
  })

  it('happy path - update offender', async () => {
    const bookingMomento = {
      stage: StageEnum.STARTED,
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      ppudOffender: {
        id: '567',
        sentences: [{ id: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380' }],
      },
      prisonOffender: {
        status: 'INACTIVE OUT',
      },
      personOnProbation: {
        nomsNumber: 'A12345',
        addresses: [
          {
            line1: '41 Newport Pagnell Rd',
            line2: 'Newtown',
            town: 'Northampton',
            postcode: 'NN4 6HP',
            noFixedAbode: false,
          },
        ],
      },
      isMainAddressWherePersonCanBeFound: {
        selected: false,
        details: '123 Acacia Avenue, Birmingham, B23 1AV',
      },
      bookRecallToPpud: {
        cro: '1234',
        ppudSentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Johnny J',
        lastName: 'Teale',
        dateOfBirth: '1970-03-15',
        prisonNumber: '7878783',
      },
    } as unknown as RecommendationResponse

    const result = await bookOffender(bookingMomento, recommendation, 'token', { xyz: true })

    expect(ppudUpdateOffender).toHaveBeenCalledWith('token', '567', {
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
      dateOfBirth: '1970-03-15',
      ethnicity: 'Irish',
      familyName: 'Teale',
      firstNames: 'Johnny J',
      gender: 'Male',
      isInCustody: false,
      nomsId: 'A12345',
      prisonNumber: '7878783',
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMomento: {
          offenderId: '567',
          sentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
          stage: 'OFFENDER_BOOKED',
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })
    expect(result).toEqual({
      offenderId: '567',
      sentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
      stage: 'OFFENDER_BOOKED',
    })
  })

  it('happy path - no fixed abode', async () => {
    const bookingMomento = {
      stage: StageEnum.STARTED,
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      prisonOffender: {
        status: 'INACTIVE OUT',
      },
      personOnProbation: {
        nomsNumber: 'A12345',
        addresses: [
          {
            noFixedAbode: true,
          },
        ],
      },
      isMainAddressWherePersonCanBeFound: {
        selected: false,
        details: '123 Acacia Avenue, Birmingham, B23 1AV',
      },
      bookRecallToPpud: {
        cro: '1234',
        custodyType: 'Determinate',
        indexOffence:
          'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
        mappaLevel: 'Level 2 - local inter-agency management',
        sentenceDate: '2023-11-16',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Johnny J',
        lastName: 'Teale',
        dateOfBirth: '1970-03-15',
        prisonNumber: '7878783',
      },
    } as unknown as RecommendationResponse

    ;(ppudCreateOffender as jest.Mock).mockResolvedValue({ offender: { id: '767', sentence: { id: '444' } } })

    const result = await bookOffender(bookingMomento, recommendation, 'token', { xyz: true })

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
        phoneNumber: '',
        postcode: '',
        premises: '',
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
    expect(result).toEqual({
      offenderId: '767',
      sentenceId: '444',
      stage: 'OFFENDER_BOOKED',
    })
  })

  it('expect failed status to clear when subsequently successful', async () => {
    const bookingMomento = {
      stage: StageEnum.STARTED,
      failed: true,
      failedMessage: '{}',
    }

    const recommendation: RecommendationResponse = {
      id: '1',
      ppudOffender: {
        id: '567',
        sentences: [{ id: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380' }],
      },
      prisonOffender: {
        status: 'INACTIVE OUT',
      },
      personOnProbation: {
        croNumber: '1234',
        nomsNumber: 'A12345',
        addresses: [
          {
            line1: '41 Newport Pagnell Rd',
            line2: 'Newtown',
            town: 'Northampton',
            postcode: 'NN4 6HP',
            noFixedAbode: false,
          },
        ],
      },
      isMainAddressWherePersonCanBeFound: {
        selected: false,
        details: '123 Acacia Avenue, Birmingham, B23 1AV',
      },
      bookRecallToPpud: {
        ppudSentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Johnny J',
        lastName: 'Teale',
        dateOfBirth: '1970-03-15',
        prisonNumber: '7878783',
      },
    } as unknown as RecommendationResponse

    const result = await bookOffender(bookingMomento, recommendation, 'token', { xyz: true })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMomento: {
          offenderId: '567',
          sentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
          stage: 'OFFENDER_BOOKED',
        },
      },
      token: 'token',
      featureFlags: {
        xyz: true,
      },
    })
    expect(result).toEqual({
      offenderId: '567',
      sentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
      stage: 'OFFENDER_BOOKED',
    })
  })
})
