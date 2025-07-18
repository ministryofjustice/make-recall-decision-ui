import bookOffender from './bookOffender'
import { StageEnum } from './StageEnum'
import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { ppudCreateOffender, ppudUpdateOffender, updateRecommendation } from '../data/makeDecisionApiClient'

jest.mock('../data/makeDecisionApiClient')

describe('book offender', () => {
  it('happy path - stage has passed', async () => {
    const bookingMemento = {
      stage: StageEnum.OFFENDER_BOOKED,
    }

    const result = await bookOffender(bookingMemento, {}, 'token', { xyz: true })

    expect(ppudCreateOffender).not.toHaveBeenCalled()
    expect(ppudUpdateOffender).not.toHaveBeenCalled()
    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(bookingMemento).toEqual(result)
  })

  it('happy path - create offender', async () => {
    const bookingMemento = {
      stage: StageEnum.STARTED,
    }

    const establishment = 'HMP Brixton'
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
            line2: 'Bethnal Green',
            town: 'London',
            postcode: 'BG1 234',
            noFixedAbode: false,
          },
        ],
      },
      isMainAddressWherePersonCanBeFound: {
        selected: false,
        details: '123 Oak Avenue, Birmingham, B23 456',
      },
      bookRecallToPpud: {
        custodyType: 'Determinate',
        indexOffence:
          'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
        mappaLevel: 'Level 2 - local inter-agency management',
        sentenceDate: '2023-11-16',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Joe J',
        lastName: 'Bloggs',
        dateOfBirth: '1970-03-15',
        currentEstablishment: establishment,
        prisonNumber: '7878783',
        cro: '1234',
      },
    } as unknown as RecommendationResponse

    ;(ppudCreateOffender as jest.Mock).mockResolvedValue({ offender: { id: '767', sentence: { id: '444' } } })

    const result = await bookOffender(bookingMemento, recommendation, 'token', { xyz: true })

    expect(ppudCreateOffender).toHaveBeenCalledWith('token', {
      additionalAddresses: [
        {
          line1: '',
          line2: '',
          phoneNumber: '',
          postcode: '',
          premises: '123 Oak Avenue, Birmingham, B23 456',
        },
      ],
      address: {
        line1: 'Bethnal Green',
        line2: 'London',
        phoneNumber: '',
        postcode: 'BG1 234',
        premises: '41 Newport Pagnell Rd',
      },
      croNumber: '1234',
      custodyType: 'Determinate',
      dateOfBirth: '1970-03-15',
      dateOfSentence: '2023-11-16',
      ethnicity: 'Irish',
      familyName: 'Bloggs',
      firstNames: 'Joe J',
      gender: 'Male',
      indexOffence:
        'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
      isInCustody: false,
      establishment,
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
          familyName: 'Bloggs',
          firstNames: 'Joe J',
          gender: 'Male',
          id: '767',
          immigrationStatus: 'N/A',
          establishment,
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
        bookingMemento: {
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
    const bookingMemento = {
      stage: StageEnum.STARTED,
    }

    const establishment = 'HMP Brixton'
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
            line2: 'Bethnal Green',
            town: 'London',
            postcode: 'BG1 234',
            noFixedAbode: false,
          },
        ],
      },
      isMainAddressWherePersonCanBeFound: {
        selected: false,
        details: '123 Oak Avenue, Birmingham, B23 456',
      },
      bookRecallToPpud: {
        cro: '1234',
        ppudIndeterminateSentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Joe J',
        lastName: 'Bloggs',
        dateOfBirth: '1970-03-15',
        currentEstablishment: establishment,
        prisonNumber: '7878783',
      },
    } as unknown as RecommendationResponse

    const result = await bookOffender(bookingMemento, recommendation, 'token', { xyz: true })

    expect(ppudUpdateOffender).toHaveBeenCalledWith('token', '567', {
      additionalAddresses: [
        {
          line1: '',
          line2: '',
          phoneNumber: '',
          postcode: '',
          premises: '123 Oak Avenue, Birmingham, B23 456',
        },
      ],
      address: {
        line1: 'Bethnal Green',
        line2: 'London',
        phoneNumber: '',
        postcode: 'BG1 234',
        premises: '41 Newport Pagnell Rd',
      },
      croNumber: '1234',
      dateOfBirth: '1970-03-15',
      ethnicity: 'Irish',
      familyName: 'Bloggs',
      firstNames: 'Joe J',
      gender: 'Male',
      isInCustody: false,
      establishment,
      nomsId: 'A12345',
      prisonNumber: '7878783',
    })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMemento: {
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
    const bookingMemento = {
      stage: StageEnum.STARTED,
    }

    const establishment = 'HMP Brixton'
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
        details: '123 Oak Avenue, Birmingham, B23 456',
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
        firstNames: 'Joe J',
        lastName: 'Bloggs',
        dateOfBirth: '1970-03-15',
        currentEstablishment: establishment,
        prisonNumber: '7878783',
      },
    } as unknown as RecommendationResponse

    ;(ppudCreateOffender as jest.Mock).mockResolvedValue({ offender: { id: '767', sentence: { id: '444' } } })

    const result = await bookOffender(bookingMemento, recommendation, 'token', { xyz: true })

    expect(ppudCreateOffender).toHaveBeenCalledWith('token', {
      additionalAddresses: [
        {
          line1: '',
          line2: '',
          phoneNumber: '',
          postcode: '',
          premises: '123 Oak Avenue, Birmingham, B23 456',
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
      familyName: 'Bloggs',
      firstNames: 'Joe J',
      gender: 'Male',
      indexOffence:
        'Permit an animal to be taken into / upon a Greater Manchester Metrolink vehicle / station without authority',
      isInCustody: false,
      establishment,
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
    const bookingMemento = {
      stage: StageEnum.STARTED,
      failed: true,
      failedMessage: '{}',
    }

    const establishment = 'HMP Brixton'
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
            line2: 'Bethnal Green',
            town: 'London',
            postcode: 'BG1 234',
            noFixedAbode: false,
          },
        ],
      },
      isMainAddressWherePersonCanBeFound: {
        selected: false,
        details: '123 Oak Avenue, Birmingham, B23 456',
      },
      bookRecallToPpud: {
        ppudIndeterminateSentenceId: '4F6666656E64657249643D3136323931342653656E74656E636549643D313231303334G1366H1380',
        gender: 'Male',
        ethnicity: 'Irish',
        firstNames: 'Joe J',
        lastName: 'Bloggs',
        dateOfBirth: '1970-03-15',
        currentEstablishment: establishment,
        prisonNumber: '7878783',
      },
    } as unknown as RecommendationResponse

    const result = await bookOffender(bookingMemento, recommendation, 'token', { xyz: true })

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookingMemento: {
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
