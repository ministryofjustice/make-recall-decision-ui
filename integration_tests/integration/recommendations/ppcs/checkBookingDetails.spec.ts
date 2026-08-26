import { faker } from '@faker-js/faker'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import setUpSessionForPpcs from './util'
import { testAccordion } from '../../../componentTests/accordion.tests'
import { SummaryList, testSummaryList } from '../../../componentTests/summaryList.tests'
import { formatDateTimeFromIsoString } from '../../../../server/utils/dates/formatting'
import CUSTODY_GROUP from '../../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { Address, RecommendationResponse } from '../../../../server/@types/make-recall-decision-api'
import { currentHighestRosh, Rosh } from '../../../../server/controllers/recommendations/helpers/rosh'
import { testForErrorPageTitle, testForErrorSummary } from '../../../componentTests/errors.tests'

context('Check Booking Details page', () => {
  const baseRecommendation = RecommendationResponseGenerator.generate()
  const testPageUrl = `/recommendations/${baseRecommendation.id}/check-booking-details`
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]
  const acoSignedStatus = {
    name: RECOMMENDATION_STATUS.ACO_SIGNED,
    active: true,
    createdByUserFullName: faker.person.fullName(),
    emailAddress: faker.internet.email(),
  }

  beforeEach(() => {
    setUpSessionForPpcs()
  })

  const checkSummaryListInAccordion = (summaryList: SummaryList) => {
    return (accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => testSummaryList(accordionSection, summaryList)
  }

  const checkSummaryListAndImageInAccordion = (summaryList: SummaryList & { image: string }) => {
    return (accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
      accordionSection.within(() => {
        cy.get('div.govuk-grid-column-one-third-from-desktop').within(() => {
          cy.get('h2').should('contain', 'Image')
          if (summaryList.image) {
            cy.get('img').should('have.attr', 'src').and('include', summaryList.image)
          } else {
            cy.get('div').should('contain', '- no value')
          }
        })
        testSummaryList(cy.get('div.govuk-grid-column-two-thirds-from-desktop'), summaryList)
      })
    }
  }

  const checkAddress = (address: Address) => {
    return (accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
      accordionSection.within(() => {
        cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

        cy.get('div.govuk-grid-column-two-thirds')
          .get('p')
          .should('contain', address.line1)
          .and('contain', address.line2)
          .and('contain', address.town)
          .and('contain', address.postcode)
      })
    }
  }

  const regexForExpectedEditedBadgeText = (value: string) => {
    return new RegExp(`\\s*Edited\\s*${value}\\s*`)
  }

  function checkBookingDetailsAccordion(
    recommendation: RecommendationResponse,
    statusResponse: { createdByUserFullName: string; emailAddress: string },
    bookingDetails?: {
      image?: string
      nomisNumber?: string
      firstNames?: string
      firstNamesEdited?: boolean
      lastName?: string
      lastNamesEdited?: boolean
      gender?: string
      ethnicity?: string
      dateOfBirth?: string
      dateOfBirthEdited?: boolean
      cro?: string
      croEdited?: boolean
      custodyStatus?: string
      custodyGroup?: string
      currentEstablishment?: string
      pncNumber?: string
      prisonNumber?: string
      prisonNumberEdited?: boolean
      releaseDate?: string
      releasingPrison?: string
      legislationReleasedUnder?: string
      addressCheckFunction?: (element: Cypress.Chainable<JQuery<HTMLElement>>) => void
      receivedDateTime?: string
      decisionDateTime?: string
      probationArea?: string
      practitionerName?: string
      practitionerEmail?: string
      practitionerPhone?: string
      localPoliceForce?: string
      acoName?: string
      acoEmail?: string
      mappaLevel?: string
      currentRosh?: string
    },
  ) {
    const image = bookingDetails?.image ?? recommendation.prisonOffender.image
    const nomisNumber = bookingDetails?.nomisNumber ?? recommendation.personOnProbation.nomsNumber
    const firstNames = bookingDetails?.firstNames ?? recommendation.bookRecallToPpud.firstNames
    const firstNamesEdited = bookingDetails?.firstNamesEdited ?? false
    const lastName = bookingDetails?.lastName ?? recommendation.bookRecallToPpud.lastName
    const lastNamesEdited = bookingDetails?.lastNamesEdited ?? false
    const gender = bookingDetails?.gender ?? recommendation.bookRecallToPpud.gender
    const ethnicity = bookingDetails?.ethnicity ?? recommendation.bookRecallToPpud.ethnicity
    const dateOfBirth = bookingDetails?.dateOfBirth ?? recommendation.bookRecallToPpud.dateOfBirth
    const dateOfBirthEdited = bookingDetails?.dateOfBirthEdited ?? false
    const cro = bookingDetails?.cro ?? recommendation.bookRecallToPpud.cro
    const croEdited = bookingDetails?.croEdited ?? false
    const custodyStatus = bookingDetails?.custodyStatus ?? 'In custody'
    const custodyGroup = bookingDetails?.custodyGroup ?? recommendation.bookRecallToPpud.custodyGroup
    const currentEstablishment =
      bookingDetails?.currentEstablishment ?? recommendation.bookRecallToPpud.currentEstablishment
    const pncNumber = bookingDetails?.pncNumber ?? recommendation.personOnProbation.pncNumber
    const prisonNumber = bookingDetails?.prisonNumber ?? recommendation.bookRecallToPpud.prisonNumber
    const prisonNumberEdited = bookingDetails?.prisonNumberEdited ?? false
    const releaseDate = bookingDetails?.releaseDate ?? recommendation.prisonOffender.releaseDate
    const releasingPrison = bookingDetails?.releasingPrison ?? recommendation.bookRecallToPpud.releasingPrison
    const legislationReleasedUnder =
      bookingDetails?.legislationReleasedUnder ?? recommendation.bookRecallToPpud.legislationReleasedUnder
    const addressCheckFunction =
      bookingDetails?.addressCheckFunction ?? checkAddress(recommendation.personOnProbation.addresses[0])
    const receivedDateTime = bookingDetails?.receivedDateTime ?? recommendation.bookRecallToPpud.receivedDateTime
    const decisionDateTime = bookingDetails?.decisionDateTime ?? recommendation.decisionDateTime
    const probationArea = bookingDetails?.probationArea ?? recommendation.bookRecallToPpud.probationArea
    const practitionerName = bookingDetails?.practitionerName ?? recommendation.practitionerForPartA.name
    const practitionerEmail = bookingDetails?.practitionerEmail ?? recommendation.practitionerForPartA.email
    const practitionerPhone = bookingDetails?.practitionerPhone ?? recommendation.practitionerForPartA.telephone
    const localPoliceForce = bookingDetails?.localPoliceForce ?? recommendation.bookRecallToPpud.policeForce
    const acoName = bookingDetails?.acoName ?? statusResponse.createdByUserFullName
    const acoEmail = bookingDetails?.acoEmail ?? statusResponse.emailAddress
    const mappaLevel = bookingDetails?.mappaLevel ?? recommendation.bookRecallToPpud.mappaLevel
    const currentRosh = bookingDetails?.currentRosh ?? currentHighestRosh(recommendation.currentRoshForPartA as Rosh)

    testAccordion(cy.get('.govuk-accordion'), {
      sections: [
        {
          heading: 'Personal details',
          summary: 'From NOMIS',
          isExpanded: true,
          contentCheck: checkSummaryListAndImageInAccordion({
            image,
            rows: [
              {
                key: 'NOMIS number',
                value: nomisNumber,
              },
              {
                key: 'First name(s)',
                value: firstNamesEdited ? undefined : firstNames,
                valueRegex: firstNamesEdited ? regexForExpectedEditedBadgeText(firstNames) : undefined,
                editLink: {
                  url: 'edit-name',
                  accessibleLabel: 'first names',
                },
              },
              {
                key: 'Last name',
                value: lastNamesEdited ? undefined : lastName,
                valueRegex: lastNamesEdited ? regexForExpectedEditedBadgeText(lastName) : undefined,
                editLink: {
                  url: 'edit-name',
                  accessibleLabel: 'last name',
                },
              },
              {
                key: 'Gender',
                value: gender,
                editLink: {
                  url: 'edit-gender',
                  accessibleLabel: 'gender',
                },
              },
              {
                key: 'Ethnicity',
                value: ethnicity,
                editLink: {
                  url: 'edit-ethnicity',
                  accessibleLabel: 'ethnicity',
                },
              },
              {
                key: 'Date of birth',
                value: dateOfBirthEdited
                  ? undefined
                  : formatDateTimeFromIsoString({
                      isoDate: dateOfBirth,
                      dateOnly: true,
                    }),
                valueRegex: dateOfBirthEdited
                  ? regexForExpectedEditedBadgeText(
                      formatDateTimeFromIsoString({
                        isoDate: dateOfBirth,
                        dateOnly: true,
                      }),
                    )
                  : undefined,
                editLink: {
                  url: 'edit-date-of-birth',
                  accessibleLabel: 'date of birth',
                },
              },
              {
                key: 'CRO',
                value: croEdited ? undefined : cro,
                valueRegex: croEdited ? regexForExpectedEditedBadgeText(cro) : undefined,
                editLink: {
                  url: 'edit-cro',
                  accessibleLabel: 'CRO',
                },
              },
            ],
          }),
        },
        {
          heading: 'Custody details',
          summary: 'From NOMIS',
          isExpanded: true,
          contentCheck: checkSummaryListInAccordion({
            rows: [
              { key: 'Custody status', value: custodyStatus },
              {
                key: 'Determinate or indeterminate',
                value: custodyGroup,
                editLink: {
                  url: 'edit-custody-group',
                  accessibleLabel: 'custody group',
                },
              },
              {
                key: 'Current establishment',
                value: currentEstablishment,
                editLink: {
                  url: 'edit-current-establishment',
                  accessibleLabel: 'current establishment',
                },
              },
            ],
          }),
        },
        {
          heading: 'Prison and licence information',
          summary: 'From NOMIS',
          isExpanded: true,
          contentCheck: checkSummaryListInAccordion({
            rows: [
              { key: 'PNC', value: pncNumber },
              {
                key: 'Prison booking number',
                value: prisonNumberEdited ? undefined : prisonNumber,
                valueRegex: prisonNumberEdited ? regexForExpectedEditedBadgeText(prisonNumber) : undefined,
                editLink: {
                  url: 'edit-prison-booking-number',
                  accessibleLabel: 'prison booking number',
                },
              },
              {
                key: 'Release date',
                value: formatDateTimeFromIsoString({
                  isoDate: releaseDate,
                  dateOnly: true,
                }),
              },
              {
                key: 'Releasing prison',
                value: releasingPrison,
                editLink: {
                  url: 'edit-releasing-prison',
                  accessibleLabel: 'releasing prison',
                },
              },
            ].concat(
              custodyGroup === CUSTODY_GROUP.DETERMINATE
                ? [
                    {
                      key: 'Legislation released under',
                      value: legislationReleasedUnder,
                      editLink: {
                        url: 'edit-legislation-released-under',
                        accessibleLabel: 'legislation released under',
                      },
                    },
                  ]
                : [],
            ),
          }),
        },
        {
          heading: 'Address',
          summary: 'From Part A',
          isExpanded: true,
          contentCheck: addressCheckFunction,
        },
        {
          heading: 'Recall information',
          summary: 'From Part A',
          isExpanded: true,
          contentCheck: checkSummaryListInAccordion({
            rows: [
              {
                key: 'Recall received date and time',
                value: receivedDateTime
                  ? formatDateTimeFromIsoString({ isoDate: receivedDateTime })
                  : 'You must enter a date and time',
                editLink: {
                  url: 'edit-recall-received-date-and-time',
                  accessibleLabel: 'recall received date and time',
                },
              },
              {
                key: 'Recall decision date and time',
                value: formatDateTimeFromIsoString({ isoDate: decisionDateTime }),
              },
            ],
          }),
        },
        {
          heading: 'Probation details',
          summary: 'From Part A',
          isExpanded: true,
          contentCheck: checkSummaryListInAccordion({
            rows: [
              {
                key: 'Probation area',
                value: probationArea,
                editLink: {
                  url: 'edit-probation-area',
                  accessibleLabel: 'probation area',
                },
              },
              { key: 'Probation practitioner', value: practitionerName },
              { key: 'Probation practitioner email', value: practitionerEmail },
              { key: 'Probation practitioner phone number', value: practitionerPhone },
              {
                key: 'Local police force',
                value: localPoliceForce,
                editLink: {
                  url: 'edit-police-contact',
                  accessibleLabel: 'local police contact',
                },
              },
              { key: 'Senior manager (ACO)', value: acoName },
              { key: 'Senior manager (ACO) email', value: acoEmail },
            ],
          }),
        },
        {
          heading: 'Risk levels',
          summary: 'From Part A',
          isExpanded: true,
          contentCheck: checkSummaryListInAccordion({
            rows: [
              {
                key: 'MAPPA level',
                value: mappaLevel,
                editLink: {
                  url: 'edit-mappa-level',
                  accessibleLabel: 'MAPPA level',
                },
              },
              {
                key: 'Current risk of serious harm',
                value: currentRosh,
              },
            ],
          }),
        },
      ],
    })
  }

  describe('Page data', () => {
    describe('All data set', () => {
      it('No Edited badges', () => {
        const recommendation = {
          ...baseRecommendation,
          bookRecallToPpud: {
            ...baseRecommendation.bookRecallToPpud,
            firstNames: `${baseRecommendation.prisonOffender.firstName} ${baseRecommendation.prisonOffender.middleName}`,
            lastName: baseRecommendation.prisonOffender.lastName,
            dateOfBirth: baseRecommendation.prisonOffender.dateOfBirth,
            prisonNumber: baseRecommendation.prisonOffender.bookingNo,
            cro: baseRecommendation.personOnProbation.croNumber,
            custodyGroup: CUSTODY_GROUP.DETERMINATE, // fixed value for this test; the logic linked to the possible values is tested thoroughly elsewhere
            legislationReleasedUnder: faker.string.alpha(10),
          },
          prisonOffender: {
            ...baseRecommendation.prisonOffender,
            status: 'ACTIVE IN', // fixed value for this test; the logic linked to the possible values is tested thoroughly elsewhere
          },
          personOnProbation: {
            ...baseRecommendation.personOnProbation,
            addresses: baseRecommendation.personOnProbation.addresses.map(address => {
              return {
                ...address,
                noFixedAbode: false, // fixed value for this test; the address logic is tested thoroughly elsewhere
              }
            }),
          },
          isMainAddressWherePersonCanBeFound: {
            selected: true, // fixed value for this test; the address logic is tested thoroughly elsewhere
          },
        }
        cy.task('getRecommendation', {
          statusCode: 200,
          response: recommendation,
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        cy.pageHeading().should('contain', `Check booking details for ${recommendation.personOnProbation.name}`)

        cy.get('h1')
          .next('p')
          .should(
            'contain',
            "These details will go into a PPUD record. You should check everything is correct and edit anything that's missing or wrong.",
          )

        checkBookingDetailsAccordion(recommendation, acoSignedStatus)
      })

      it('Edited badges on all applicable fields', () => {
        const recommendation = {
          ...baseRecommendation,
          bookRecallToPpud: {
            ...baseRecommendation.bookRecallToPpud,
            custodyGroup: CUSTODY_GROUP.DETERMINATE, // fixed value for this test; the logic linked to the possible values is tested thoroughly elsewhere
            legislationReleasedUnder: faker.string.alpha(10),
          },
          prisonOffender: {
            ...baseRecommendation.prisonOffender,
            status: 'ACTIVE IN', // fixed value for this test; the logic linked to the possible values is tested thoroughly elsewhere
          },
          personOnProbation: {
            ...baseRecommendation.personOnProbation,
            addresses: baseRecommendation.personOnProbation.addresses.map(address => {
              return {
                ...address,
                noFixedAbode: false, // fixed value for this test; the address logic is tested thoroughly elsewhere
              }
            }),
          },
          isMainAddressWherePersonCanBeFound: {
            selected: true, // fixed value for this test; the address logic is tested thoroughly elsewhere
          },
        }
        cy.task('getRecommendation', {
          statusCode: 200,
          response: recommendation,
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        checkBookingDetailsAccordion(recommendation, acoSignedStatus, {
          firstNamesEdited: true,
          lastNamesEdited: true,
          dateOfBirthEdited: true,
          croEdited: true,
          prisonNumberEdited: true,
        })
      })
    })

    it('No data set', () => {
      const recommendation = {
        ...baseRecommendation,
        bookRecallToPpud: {
          ...baseRecommendation.bookRecallToPpud,
          firstNames: undefined,
          lastName: undefined,
          gender: undefined,
          ethnicity: undefined,
          dateOfBirth: undefined,
          prisonNumber: undefined,
          cro: undefined,
          custodyGroup: undefined,
          currentEstablishment: undefined,
          releasingPrison: undefined,
          receivedDateTime: undefined,
          probationArea: undefined,
          policeForce: undefined,
          mappaLevel: undefined,
        },
        prisonOffender: {
          ...baseRecommendation.prisonOffender,
          releaseDate: undefined,
          image: undefined,
        },
        personOnProbation: {
          ...baseRecommendation.personOnProbation,
          nomsNumber: undefined,
          pncNumber: undefined,
          addresses: undefined,
        },
        isMainAddressWherePersonCanBeFound: {
          selected: false,
        },
        practitionerForPartA: undefined,
        whoCompletedPartA: {},
      }
      cy.task('getRecommendation', {
        statusCode: 200,
        response: recommendation,
      })
      cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

      cy.visit(testPageUrl)

      cy.pageHeading().should('contain', `Check booking details for ${recommendation.personOnProbation.name}`)

      cy.get('h1')
        .next('p')
        .should(
          'contain',
          "These details will go into a PPUD record. You should check everything is correct and edit anything that's missing or wrong.",
        )

      const blankIndicator = ' - no value'

      checkBookingDetailsAccordion(recommendation, acoSignedStatus, {
        image: undefined,
        nomisNumber: blankIndicator,
        firstNames: blankIndicator,
        firstNamesEdited: false,
        lastName: blankIndicator,
        lastNamesEdited: false,
        gender: 'You must enter a gender',
        ethnicity: 'Enter an ethnicity',
        dateOfBirth: blankIndicator,
        dateOfBirthEdited: false,
        cro: blankIndicator,
        croEdited: false,
        custodyStatus: blankIndicator,
        custodyGroup: 'You must enter determinate or indeterminate',
        currentEstablishment: 'Enter an establishment',
        pncNumber: blankIndicator,
        prisonNumber: blankIndicator,
        prisonNumberEdited: false,
        releaseDate: blankIndicator,
        releasingPrison: 'Enter a releasing prison',
        legislationReleasedUnder: recommendation.bookRecallToPpud.legislationReleasedUnder,
        addressCheckFunction: (accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
          accordionSection.within(() => {
            cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

            cy.get('div.govuk-grid-column-two-thirds').should('contain', blankIndicator)
          })
        },
        receivedDateTime: undefined,
        // There is no blank-safe behaviour set for the decisionDateTime fields, as
        // there's no way of reaching this page without the decision being made
        decisionDateTime: recommendation.decisionDateTime,
        probationArea: 'Enter a probation area',
        practitionerName: blankIndicator,
        practitionerEmail: blankIndicator,
        practitionerPhone: blankIndicator,
        localPoliceForce: 'Enter a local police force',
        // There is no blank-safe behaviour set for these ACO fields, as
        // there's no way of reaching this page without the ACO signature
        acoName: acoSignedStatus.createdByUserFullName,
        acoEmail: acoSignedStatus.emailAddress,
        mappaLevel: 'Enter a MAPPA level',
        // There is no blank-safe behaviour set for this field
        currentRosh: currentHighestRosh(recommendation.currentRoshForPartA as Rosh),
      })
    })

    // TODO test custody status variations

    // TODO test determinate/indeterminate variations

    describe('Address variations', () => {
      const recommendation = {
        ...baseRecommendation,
        bookRecallToPpud: {
          ...baseRecommendation.bookRecallToPpud,
          custodyGroup: CUSTODY_GROUP.DETERMINATE, // fixed value for this test; the logic linked to the possible values is tested thoroughly elsewhere
          legislationReleasedUnder: faker.string.alpha(10),
        },
        prisonOffender: {
          ...baseRecommendation.prisonOffender,
          status: 'ACTIVE IN', // fixed value for this test; the logic linked to the possible values is tested thoroughly elsewhere
        },
      }

      function checkAccordionAddress(checkAddressFunction: (element: Cypress.Chainable<JQuery<HTMLElement>>) => void) {
        checkBookingDetailsAccordion(recommendation, acoSignedStatus, {
          addressCheckFunction: checkAddressFunction,
        })
      }

      it('no last known address nor details on where to find the PoP', () => {
        cy.task('getRecommendation', {
          statusCode: 200,
          response: {
            ...recommendation,
            personOnProbation: {
              ...recommendation.personOnProbation,
              addresses: undefined,
            },
            isMainAddressWherePersonCanBeFound: {
              selected: true,
            },
          },
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        checkAccordionAddress((accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
          accordionSection.within(() => {
            cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

            cy.get('div.govuk-grid-column-two-thirds').should('contain', '- no value')

            cy.get('pre').should('not.exist')
          })
        })
      })

      it('no last known address but details provided on where to find the PoP', () => {
        const additionalAddressDetails = faker.location.streetAddress()
        cy.task('getRecommendation', {
          statusCode: 200,
          response: {
            ...recommendation,
            personOnProbation: {
              ...recommendation.personOnProbation,
              addresses: undefined,
            },
            isMainAddressWherePersonCanBeFound: {
              selected: false,
              details: additionalAddressDetails,
            },
          },
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        checkAccordionAddress((accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
          accordionSection.within(() => {
            cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

            cy.get('div.govuk-grid-column-two-thirds').should('contain', '- no value')
            cy.get('div.govuk-grid-column-two-thirds').within(() => {
              cy.get('p').should('contain', 'Additional address')
              cy.get('pre').should('contain', additionalAddressDetails)
            })
          })
        })
      })

      it('has fixed addresses and PoP is at main address', () => {
        cy.task('getRecommendation', {
          statusCode: 200,
          response: {
            ...recommendation,
            personOnProbation: {
              ...recommendation.personOnProbation,
              addresses: recommendation.personOnProbation.addresses.map(address => {
                return {
                  ...address,
                  noFixedAbode: false,
                }
              }),
            },
            isMainAddressWherePersonCanBeFound: {
              selected: true,
            },
          },
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        checkAccordionAddress((accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
          accordionSection.within(() => {
            cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

            cy.get('div.govuk-grid-column-two-thirds').within(() => {
              recommendation.personOnProbation.addresses.forEach((address, index) => {
                cy.get('p')
                  .eq(index)
                  .invoke('text')
                  .should(
                    'match',
                    new RegExp(
                      `\\s*${address.line1}\\s*${address.line2}\\s*${address.town}\\s*${address.postcode}\\s*`,
                    ),
                  )
              })

              cy.get('pre').should('not.exist')
            })
          })
        })
      })

      it('has fixed addresses but PoP is not at main address', () => {
        const additionalAddressDetails = faker.location.streetAddress()
        cy.task('getRecommendation', {
          statusCode: 200,
          response: {
            ...recommendation,
            personOnProbation: {
              ...recommendation.personOnProbation,
              addresses: recommendation.personOnProbation.addresses.map(address => {
                return {
                  ...address,
                  noFixedAbode: false,
                }
              }),
            },
            isMainAddressWherePersonCanBeFound: {
              selected: false,
              details: additionalAddressDetails,
            },
          },
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        checkAccordionAddress((accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
          accordionSection.within(() => {
            cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

            cy.get('div.govuk-grid-column-two-thirds').within(() => {
              recommendation.personOnProbation.addresses.forEach((address, index) => {
                cy.get('p')
                  .eq(index)
                  .invoke('text')
                  .should(
                    'match',
                    new RegExp(
                      `\\s*${address.line1}\\s*${address.line2}\\s*${address.town}\\s*${address.postcode}\\s*`,
                    ),
                  )
              })
              cy.get('p')
                .eq(recommendation.personOnProbation.addresses.length)
                .invoke('text')
                .should('contain', 'Additional address')
              cy.get('pre').should('contain', additionalAddressDetails)
            })
          })
        })
      })

      it('has no fixed abode and PoP is at main address', () => {
        cy.task('getRecommendation', {
          statusCode: 200,
          response: {
            ...recommendation,
            personOnProbation: {
              ...recommendation.personOnProbation,
              addresses: [{ noFixedAbode: true }],
            },
            isMainAddressWherePersonCanBeFound: {
              selected: true,
            },
          },
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        checkAccordionAddress((accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
          accordionSection.within(() => {
            cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

            cy.get('div.govuk-grid-column-two-thirds').within(() => {
              recommendation.personOnProbation.addresses.forEach((address, index) => {
                cy.get('p').eq(index).invoke('text').should('contain', 'No fixed abode')
              })

              cy.get('pre').should('not.exist')
            })
          })
        })
      })

      it('has no fixed abode but PoP is not at main address', () => {
        const additionalAddressDetails = faker.location.streetAddress()
        cy.task('getRecommendation', {
          statusCode: 200,
          response: {
            ...recommendation,
            personOnProbation: {
              ...recommendation.personOnProbation,
              addresses: [{ noFixedAbode: true }],
            },
            isMainAddressWherePersonCanBeFound: {
              selected: false,
              details: additionalAddressDetails,
            },
          },
        })
        cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

        cy.visit(testPageUrl)

        checkAccordionAddress((accordionSection: Cypress.Chainable<JQuery<HTMLElement>>) => {
          accordionSection.within(() => {
            cy.get('div.govuk-grid-column-one-third').get('p').should('contain', 'Last known address')

            cy.get('div.govuk-grid-column-two-thirds').within(() => {
              recommendation.personOnProbation.addresses.forEach((address, index) => {
                cy.get('p').eq(index).invoke('text').should('contain', 'No fixed abode')
              })

              cy.get('p')
                .eq(recommendation.personOnProbation.addresses.length)
                .invoke('text')
                .should('contain', 'Additional address')
              cy.get('pre').should('contain', additionalAddressDetails)
            })
          })
        })
      })
    })

    // TODO test practitioner variations
  })

  describe('Error message display', () => {
    const commonErrors = [
      {
        href: 'gender',
        message: 'Enter gender',
        errorComponentId: 'check-booking-personal-details-list-gender-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
      {
        href: 'ethnicity',
        message: 'Enter ethnicity',
        errorComponentId: 'check-booking-personal-details-list-ethnicity-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
      {
        href: 'currentEstablishment',
        message: 'Select an establishment from the list',
        errorComponentId: 'check-booking-custody-details-list-current-establishment-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
      {
        href: 'receivedDateTime',
        message: 'You must enter a recall received date and time',
        errorComponentId: 'check-booking-recall-information-list-recall-received-date-and-time-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
      {
        href: 'probationArea',
        message: 'Enter probation area',
        errorComponentId: 'check-booking-probation-details-list-probation-area-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
      {
        href: 'policeForce',
        message: 'Enter police force',
        errorComponentId: 'check-booking-probation-details-list-local-police-force-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
      {
        href: 'releasingPrison',
        message: 'Select a releasing prison from the list',
        errorComponentId: 'check-booking-prison-and-licence-details-list-releasing-prison-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
      {
        href: 'mappaLevel',
        message: 'Enter MAPPA level',
        errorComponentId: 'check-booking-risk-levels-list-mappa-level-row',
        checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
      },
    ]

    it('Displays error messages when none of the mandatory data is set', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...baseRecommendation,
          bookRecallToPpud: {},
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

      cy.visit(testPageUrl)

      cy.get('button.govuk-button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        ...commonErrors,
        {
          href: 'custodyGroup',
          message: 'Select the correct sentence type',
          errorComponentId: 'check-booking-custody-details-list-determinate-or-indeterminate-row',
          checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
        },
      ])
    })

    it('Displays error messages when only custody group is set to determinate (legislation released under mandatory)', () => {
      cy.task('getRecommendation', {
        statusCode: 200,
        response: {
          ...baseRecommendation,
          bookRecallToPpud: {
            custodyGroup: CUSTODY_GROUP.DETERMINATE,
          },
        },
      })
      cy.task('getStatuses', { statusCode: 200, response: [...defaultPPCSStatusResponse, acoSignedStatus] })

      cy.visit(testPageUrl)

      cy.get('button.govuk-button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        ...commonErrors,
        {
          href: 'legislationReleasedUnder',
          message: 'Enter legislation',
          errorComponentId: 'check-booking-prison-and-licence-details-list-legislation-released-under-row',
          checkFieldHasErrorStyling: false, // summary list items add an error message but don't set an error class on the entire row
        },
      ])
    })
  })
})
