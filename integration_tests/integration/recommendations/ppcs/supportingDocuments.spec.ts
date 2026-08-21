import { RecommendationResponseGenerator } from '../../../../data/recommendations/recommendationGenerator'
import RECOMMENDATION_STATUS from '../../../../server/middleware/recommendationStatus'
import setUpSessionForPpcs from './util'

context('Supporting documents upload page', () => {
  const testPageUrl = '/recommendations/123/supporting-documents'
  const recommendationResponse = RecommendationResponseGenerator.generate()
  const defaultPPCSStatusResponse = [{ name: RECOMMENDATION_STATUS.SENT_TO_PPCS, active: true }]

  beforeEach(() => {
    setUpSessionForPpcs()
    cy.task('getRecommendation', {
      statusCode: 200,
      response: {
        ...recommendationResponse,
      },
    })
    cy.task('getStatuses', { statusCode: 200, response: defaultPPCSStatusResponse })
  })

  describe('Page data', () => {
    it('Loads the page correctly without existing documents', () => {
      cy.task('getSupportingDocuments', { statusCode: 200, response: [] })

      cy.visit(testPageUrl)

      cy.pageHeading().should(
        'contains',
        `Add supporting documents for ${recommendationResponse.personOnProbation.name}`,
      )

      cy.getElement('Make sure the files are named correctly before you upload them. Upload the:').should('exist')
      cy.get('.govuk-list.govuk-list--bullet')
        .should('exist')
        .within(() => {
          cy.get('li').should('have.length', 7)

          const bulletPoints = [
            'Part A',
            'licence',
            'email from probation',
            'OASys report',
            `previous convictions (MG16), if ${recommendationResponse.personOnProbation.name} is getting a standard recall`,
            `pre-sentence report (PSR), if ${recommendationResponse.personOnProbation.name} has one`,
            `police charge sheet, if ${recommendationResponse.personOnProbation.name} is being recalled because of being charged with an offence`,
          ]

          bulletPoints.forEach((point, idx) => {
            cy.get('li').eq(idx).should('contain.text', point)
          })
        })

      cy.getElement('Upload files').should('exist')
      cy.getElement('You can upload Word, PDF or plain text (txt) files. The maximum size is 25MB.').should('exist')

      cy.get('.moj-multi-file-upload__dropzone')
        .should('exist')
        .within(() => {
          cy.get('.moj-multi-file-upload__input').should('exist')
          cy.get('p.govuk-body').should('exist').should('contain.text', 'Drag and drop files here or')
          cy.get('label').should('exist').should('contain.text', 'Choose files')
        })

      cy.get('.moj-multi-file-upload__row').should('not.exist')
      cy.get('.moj-multi-file__uploaded-files').should('have.class', 'moj-hidden')

      cy.get('a.govuk-button.govuk-button--primary')
        .should('exist')
        .should('contain.text', 'Continue')
        .should('have.attr', 'href', 'add-minutes')
    })

    it('Loads the existing files list correctly', () => {
      cy.task('getSupportingDocuments', { statusCode: 200, response: [{ id: '1234', filename: 'sample-file.pdf' }] })

      cy.visit(testPageUrl)

      cy.get('.moj-multi-file__uploaded-files')
        .should('exist')
        .within(() => {
          cy.get('h2').should('contain.text', 'Files added')
          cy.get('p').should('contain.text', 'If you need to change a file, delete it and upload a new one.')

          cy.get('.govuk-summary-list.moj-multi-file-upload__list')
            .should('exist')
            .within(() => {
              cy.get('.moj-multi-file-upload__message').should('contain.text', 'sample-file.pdf')
              cy.get('.moj-multi-file-upload__progress')
                .get('strong')
                .should('have.class', 'govuk-tag--green')
                .should('contain.text', 'Uploaded')

              cy.get('.moj-multi-file-upload__actions button')
                .should('have.attr', 'value', '1234')
                .should('contain.text', 'Delete sample-file.pdf')
            })
        })
    })
  })

  describe('uploading a file', () => {
    it('should allow for a valid file to be uploaded', () => {
      cy.task('getSupportingDocuments', { statusCode: 200, response: [] })
      cy.task('uploadSupportingDocument', {
        statusCode: 200,
        response: { id: '123' },
      })

      cy.visit(testPageUrl)

      // This adds a delay to the mocked response so we can confirm the
      // expected loading state badges
      cy.intercept('POST', '**/supporting-documents*', req => {
        req.on('response', res => {
          res.setDelay(1500)
        })
      }).as('uploadDelayed')

      cy.get('input[type=file]').selectFile('integration_tests/fixtures/test.pdf', { force: true })

      cy.get('.govuk-summary-list.moj-multi-file-upload__list')
        .should('exist')
        .within(() => {
          cy.get('.moj-multi-file-upload__row')
            .should('exist')
            .eq(0)
            .within(() => {
              cy.get('.moj-multi-file-upload__progress')
                .get('strong')
                .should('have.class', 'govuk-tag--yellow')
                .should('contain.text', 'Uploading')
            })
        })

      cy.wait('@uploadDelayed')

      cy.get('.govuk-summary-list.moj-multi-file-upload__list')
        .should('exist')
        .within(() => {
          cy.get('.moj-multi-file-upload__message').should('contain.text', 'test.pdf')
          cy.get('.moj-multi-file-upload__progress')
            .get('strong')
            .should('have.class', 'govuk-tag--green')
            .should('contain.text', 'Uploaded')

          cy.get('.moj-multi-file-upload__actions button')
            .should('have.attr', 'value', '123')
            .should('contain.text', 'Delete test.pdf')
        })
    })

    it('show validation errors', () => {
      cy.task('getSupportingDocuments', { statusCode: 200, response: [] })

      cy.visit(testPageUrl)

      cy.get('input[type=file]').selectFile(
        {
          contents: Cypress.Buffer.alloc(26 * 1024 * 1024),
          fileName: 'too-big.pdf',
          mimeType: 'application/pdf',
          lastModified: Date.now(),
        },
        { force: true },
      )

      cy.get('.govuk-summary-list.moj-multi-file-upload__list').within(() => {
        cy.get('.moj-multi-file-upload__message').should('contain.text', 'too-big.pdf')
        cy.get('.moj-multi-file-upload__progress').get('span').eq(0).should('contain.text', 'too-big.pdf')

        cy.get('.moj-multi-file-upload__progress')
          .get('span')
          .eq(1)
          .should('contain.text', "'too-big.pdf' must be smaller than 25MB. Delete it and upload a smaller version")

        cy.get('.moj-multi-file-upload__actions button')
          .should('have.attr', 'value', '')
          .should('contain.text', 'Delete')
      })
    })
  })

  describe('deleting a file', () => {
    it('should allow a valid file to be deleted', () => {
      cy.task('getSupportingDocuments', { statusCode: 200, response: [{ id: '1234', filename: 'sample-file.pdf' }] })
      cy.task('deleteSupportingDocument', { statusCode: 200, response: {} })

      cy.visit(testPageUrl)

      cy.get('.moj-multi-file__uploaded-files')
        .should('exist')
        .within(() => {
          cy.get('.govuk-summary-list.moj-multi-file-upload__list').within(() => {
            cy.get('.moj-multi-file-upload__actions button').click()
          })
        })

      cy.get('.moj-multi-file-upload__row').should('not.exist')
      cy.get('.moj-multi-file__uploaded-files').should('have.class', 'moj-hidden')
    })

    it('should allow an invalid file to be deleted (removed from list)', () => {
      cy.task('getSupportingDocuments', { statusCode: 200, response: [] })

      cy.visit(testPageUrl)

      cy.get('input[type=file]').selectFile(
        {
          contents: Cypress.Buffer.alloc(26 * 1024 * 1024),
          fileName: 'too-big.pdf',
          mimeType: 'application/pdf',
          lastModified: Date.now(),
        },
        { force: true },
      )

      cy.get('.moj-multi-file__uploaded-files')
        .should('exist')
        .within(() => {
          cy.get('.govuk-summary-list.moj-multi-file-upload__list').within(() => {
            cy.get('.moj-multi-file-upload__actions button').click()
          })
        })

      cy.get('.moj-multi-file-upload__row').should('not.exist')
      cy.get('.moj-multi-file__uploaded-files').should('have.class', 'moj-hidden')
    })
  })
})
