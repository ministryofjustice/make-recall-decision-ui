import { faker } from '@faker-js/faker'
import validateRecallType from './formValidator'
import EVENTS from '../../../utils/constants'
import bindPlaceholderValues from '../../../utils/automatedFieldValues/binding'
import strings from '../../../textStrings/en'
import { availableRecallTypes, availableRecallTypesFTR56 } from './availableRecallTypes'

jest.mock('../../../utils/automatedFieldValues/binding')
jest.mock('./availableRecallTypes')

describe('validateRecallType', () => {
  const recommendationId = '456'
  const urlInfo = {
    currentPageId: 'recall-type',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/recall-type`,
  }

  describe('valid', () => {
    ;[true, false].forEach(flagFTR56Enabled => {
      describe(`with FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
        const recallTypes = faker.helpers.multiple(
          () => {
            return {
              value: faker.lorem.word(),
              text: faker.lorem.word(),
            }
          },
          { count: 3 },
        )

        beforeEach(() => {
          ;(availableRecallTypes as jest.Mock).mockReturnValueOnce(recallTypes)
          ;(availableRecallTypesFTR56 as jest.Mock).mockReturnValueOnce(recallTypes)
        })

        it('returns valuesToSave, sets isThisAnEmergencyRecall to false if valid fixed term recall selected', async () => {
          const requestBody = {
            recallType: 'FIXED_TERM',
            recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
            crn: 'X34534',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(errors).toBeUndefined()
          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(false)
          }
          expect(valuesToSave).toEqual({
            recallType: {
              selected: {
                value: 'FIXED_TERM',
                details: requestBody.recallTypeDetailsFixedTerm,
              },
              allOptions: recallTypes,
            },
            isThisAnEmergencyRecall: false,
          })
        })

        it('returns valuesToSave, sets isThisAnEmergencyRecall to null if valid fixed term recall selected and fromPageId is task list and value changed', async () => {
          const requestBody = {
            recallType: 'FIXED_TERM',
            recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
            crn: 'X34534',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }
          const urlInfoCopy = { ...urlInfo, fromPageId: 'task-list' }

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo: urlInfoCopy,
            flagFTR56Enabled,
          })

          expect(errors).toBeUndefined()
          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(false)
          }
          expect(valuesToSave).toEqual({
            recallType: {
              selected: {
                value: 'FIXED_TERM',
                details: requestBody.recallTypeDetailsFixedTerm,
              },
              allOptions: recallTypes,
            },
            isThisAnEmergencyRecall: null,
          })
        })

        it('returns no isThisAnEmergencyRecall if recall type is set to FIXED_TERM and is not changed', async () => {
          const requestBody = {
            recallType: 'FIXED_TERM',
            recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
            crn: 'X34534',
            originalRecallType: 'FIXED_TERM',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }
          const urlInfoCopy = { ...urlInfo, fromPageId: 'task-list' }

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo: urlInfoCopy,
            flagFTR56Enabled,
          })

          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(false)
          }
          expect(errors).toBeUndefined()
          expect(valuesToSave.isThisAnEmergencyRecall).toBeUndefined()
        })

        it('returns monitoring event data', async () => {
          const requestBody = {
            recallType: 'FIXED_TERM',
            recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
            crn: 'X34534',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }

          const { monitoringEvent } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(false)
          }
          expect(monitoringEvent).toEqual({
            eventName: EVENTS.MRD_RECALL_TYPE,
            data: {
              recallType: 'FIXED_TERM',
            },
          })
        })

        it('returns valuesToSave, sets isThisAnEmergencyRecall to null if valid standard recall selected', async () => {
          const requestBody = {
            recallType: 'STANDARD',
            recallTypeDetailsStandard: '<br />I recommend standard recall...',
            crn: 'X34534',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(errors).toBeUndefined()
          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(false)
          }
          expect(valuesToSave).toEqual({
            recallType: {
              selected: {
                value: 'STANDARD',
                details: 'I recommend standard recall...',
              },
              allOptions: recallTypes,
            },
            isThisAnEmergencyRecall: null,
          })
        })

        it('returns no isThisAnEmergencyRecall if recall type is set to STANDARD and is not changed', async () => {
          const requestBody = {
            recallType: 'STANDARD',
            recallTypeDetailsStandard: '<br />I recommend standard recall...',
            crn: 'X34534',
            originalRecallType: 'STANDARD',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(errors).toBeUndefined()
          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(false)
          }
          expect(valuesToSave.isThisAnEmergencyRecall).toBeUndefined()
        })

        it('returns valuesToSave and no errors if valid no recall selected', async () => {
          const ftrMandatory = faker.datatype.boolean()
          const requestBody = {
            recallType: 'NO_RECALL',
            crn: 'X34534',
            ftrMandatory: ftrMandatory.toString(),
            standardMandatory: 'false',
          }

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(errors).toBeUndefined()

          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(ftrMandatory, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(ftrMandatory)
          }
          expect(valuesToSave).toEqual({
            recallType: {
              selected: {
                value: 'NO_RECALL',
              },
              allOptions: recallTypes,
            },
            isThisAnEmergencyRecall: null,
          })
        })

        it('returns no isThisAnEmergencyRecall if recall type is set to NO_RECALL and is not changed', async () => {
          const ftrMandatory = faker.datatype.boolean()
          const requestBody = {
            recallType: 'NO_RECALL',
            crn: 'X34534',
            originalRecallType: 'NO_RECALL',
            ftrMandatory: ftrMandatory.toString(),
            standardMandatory: 'false',
          }

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(errors).toBeUndefined()
          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(ftrMandatory, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(ftrMandatory)
          }
          expect(valuesToSave.isThisAnEmergencyRecall).toBeUndefined()
        })

        it('returns no missingRecallTypeDetail if fixed term recall is selected but no details sent whilst FTR is Mandatory', async () => {
          const requestBody = {
            recallType: 'FIXED_TERM',
            recallTypeDetailsFixedTerm: ' ', // whitespace
            crn: 'X34534',
            ftrMandatory: 'true',
            personOnProbationName: faker.person.fullName(),
            standardMandatory: 'false',
          }
          const expectedDetails = faker.lorem.sentence()
          ;(bindPlaceholderValues as jest.Mock).mockReturnValueOnce(expectedDetails)

          const { errors, valuesToSave } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(errors).toBeUndefined()
          if (flagFTR56Enabled) {
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(true, false)
          } else {
            expect(availableRecallTypes).toHaveBeenCalledWith(true)
          }
          expect(valuesToSave.recallType).toEqual({
            selected: {
              value: requestBody.recallType,
              details: expectedDetails,
            },
            allOptions: recallTypes,
          })
          if (flagFTR56Enabled) {
            expect(bindPlaceholderValues).toHaveBeenCalledWith(
              strings.automatedFieldValues.mandatoryFTRRationaleFTR56,
              {
                personOnProbationName: requestBody.personOnProbationName,
              },
            )
          } else {
            expect(bindPlaceholderValues).toHaveBeenCalledWith(strings.automatedFieldValues.mandatoryFTRRationale, {
              personOnProbationName: requestBody.personOnProbationName,
            })
          }
        })

        if (flagFTR56Enabled) {
          it('returns no missingRecallTypeDetail if standard recall is selected but no details sent whilst Standard is Mandatory', async () => {
            const requestBody = {
              recallType: 'STANDARD',
              recallTypeDetailsStandard: ' ', // whitespace
              crn: 'X34534',
              ftrMandatory: 'false',
              personOnProbationName: faker.person.fullName(),
              standardMandatory: 'true',
            }
            const expectedDetails = faker.lorem.sentence()
            ;(bindPlaceholderValues as jest.Mock).mockReturnValueOnce(expectedDetails)

            const { errors, valuesToSave } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo,
              flagFTR56Enabled,
            })

            expect(errors).toBeUndefined()
            expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, true)
            expect(valuesToSave.recallType).toEqual({
              selected: {
                value: requestBody.recallType,
                details: expectedDetails,
              },
              allOptions: recallTypes,
            })
            expect(bindPlaceholderValues).toHaveBeenCalledWith(
              strings.automatedFieldValues.mandatoryStandardRationaleFTR56,
              {
                personOnProbationName: requestBody.personOnProbationName,
              },
            )
          })
        }

        describe('Redirects', () => {
          it('redirects to emergency recall if Fixed term recall is selected', async () => {
            const requestBody = {
              recallType: 'FIXED_TERM',
              recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
              crn: 'X34534',
              ftrMandatory: 'false',
              standardMandatory: 'false',
            }

            const { nextPagePath } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo,
              flagFTR56Enabled,
            })

            if (flagFTR56Enabled) {
              expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
            } else {
              expect(availableRecallTypes).toHaveBeenCalledWith(false)
            }
            expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
          })

          it('redirects to emergency recall if Standard recall is selected', async () => {
            const requestBody = {
              recallType: 'STANDARD',
              recallTypeDetailsStandard: 'I recommend fixed term recall...',
              crn: 'X34534',
              ftrMandatory: 'false',
              standardMandatory: 'false',
            }

            const { nextPagePath } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo,
              flagFTR56Enabled,
            })

            if (flagFTR56Enabled) {
              expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
            } else {
              expect(availableRecallTypes).toHaveBeenCalledWith(false)
            }
            expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
          })

          it('redirects to no recall letter page if No recall is selected', async () => {
            const ftrMandatory = faker.datatype.boolean()
            const requestBody = {
              recallType: 'NO_RECALL',
              crn: 'X34534',
              ftrMandatory: ftrMandatory.toString(),
              standardMandatory: 'false',
            }

            const { nextPagePath } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo,
              flagFTR56Enabled,
            })

            if (flagFTR56Enabled) {
              expect(availableRecallTypesFTR56).toHaveBeenCalledWith(ftrMandatory, false)
            } else {
              expect(availableRecallTypes).toHaveBeenCalledWith(ftrMandatory)
            }
            expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall`)
          })

          it('if "from page" is set, ignore it if a fixed term recall is selected', async () => {
            const requestBody = {
              recallType: 'FIXED_TERM',
              recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
              crn: 'X34534',
              ftrMandatory: 'false',
              standardMandatory: 'false',
            }
            const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }

            const { nextPagePath } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo: urlInfoWithFromPage,
              flagFTR56Enabled,
            })

            if (flagFTR56Enabled) {
              expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
            } else {
              expect(availableRecallTypes).toHaveBeenCalledWith(false)
            }
            expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
          })

          it('if "from page" is set, ignore it if a standard recall is selected', async () => {
            const requestBody = {
              recallType: 'STANDARD',
              recallTypeDetailsStandard: 'I recommend standard recall...',
              crn: 'X34534',
              ftrMandatory: 'false',
              standardMandatory: 'false',
            }
            const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }

            const { nextPagePath } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo: urlInfoWithFromPage,
              flagFTR56Enabled,
            })

            if (flagFTR56Enabled) {
              expect(availableRecallTypesFTR56).toHaveBeenCalledWith(false, false)
            } else {
              expect(availableRecallTypes).toHaveBeenCalledWith(false)
            }
            expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
          })

          it('if "from page" is set, ignore it if No recall is selected', async () => {
            const ftrMandatory = faker.datatype.boolean()
            const requestBody = {
              recallType: 'NO_RECALL',
              crn: 'X34534',
              ftrMandatory: ftrMandatory.toString(),
              standardMandatory: 'false',
            }
            const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }

            const { nextPagePath } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo: urlInfoWithFromPage,
              flagFTR56Enabled,
            })

            if (flagFTR56Enabled) {
              expect(availableRecallTypesFTR56).toHaveBeenCalledWith(ftrMandatory, false)
            } else {
              expect(availableRecallTypes).toHaveBeenCalledWith(ftrMandatory)
            }
            expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall`)
          })
        })
      })
    })
  })

  describe('invalid', () => {
    ;[true, false].forEach(flagFTR56Enabled => {
      describe(`with FTR56 flag ${flagFTR56Enabled ? 'enabled' : 'disabled'}`, () => {
        it('errors if fixed term recall is selected but standard detail sent', async () => {
          const requestBody = {
            recallType: 'FIXED_TERM',
            recallTypeDetailsStandard: 'I recommend fixed term recall...',
            crn: 'X34534',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }

          const { errors, valuesToSave, unsavedValues } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(valuesToSave).toBeUndefined()
          expect(unsavedValues).toEqual({
            recallType: 'FIXED_TERM',
          })
          expect(errors).toEqual([
            {
              href: '#recallTypeDetailsFixedTerm',
              name: 'recallTypeDetailsFixedTerm',
              text: 'Explain why you recommend this recall type',
              errorId: 'missingRecallTypeDetail',
            },
          ])
        })

        it('errors if fixed term recall is selected but no detail sent whilst FTR is Discretionary', async () => {
          const requestBody = {
            recallType: 'FIXED_TERM',
            recallTypeDetailsFixedTerm: ' ', // whitespace
            crn: 'X34534',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }

          const { errors, valuesToSave, unsavedValues } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(valuesToSave).toBeUndefined()
          expect(unsavedValues).toEqual({
            recallType: 'FIXED_TERM',
          })
          expect(errors).toEqual([
            {
              href: '#recallTypeDetailsFixedTerm',
              name: 'recallTypeDetailsFixedTerm',
              text: 'Explain why you recommend this recall type',
              errorId: 'missingRecallTypeDetail',
            },
          ])
        })

        it('errors if standard recall is selected but fixed term detail sent', async () => {
          const requestBody = {
            recallType: 'STANDARD',
            recallTypeDetailsFixedTerm: 'I recommend standard recall...',
            crn: 'X34534',
            ftrMandatory: 'false',
            standardMandatory: 'false',
          }

          const { errors, valuesToSave, unsavedValues } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(valuesToSave).toBeUndefined()
          expect(unsavedValues).toEqual({
            recallType: 'STANDARD',
          })
          expect(errors).toEqual([
            {
              href: '#recallTypeDetailsStandard',
              name: 'recallTypeDetailsStandard',
              text: 'Explain why you recommend this recall type',
              errorId: 'missingRecallTypeDetail',
            },
          ])
        })

        // standard recall can be mandatory in some FTR56 cases, so we only keep this check for pre-FTR56 logic
        if (!flagFTR56Enabled) {
          it('errors if standard recall is selected but no detail sent whilst standard is Discretionary', async () => {
            const requestBody = {
              recallType: 'STANDARD',
              recallTypeDetailsStandard: '',
              crn: 'X34534',
              ftrMandatory: 'false',
              standardMandatory: 'false',
            }

            const { errors, valuesToSave, unsavedValues } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo,
              flagFTR56Enabled,
            })

            expect(valuesToSave).toBeUndefined()
            expect(unsavedValues).toEqual({
              recallType: 'STANDARD',
            })
            expect(errors).toEqual([
              {
                href: '#recallTypeDetailsStandard',
                name: 'recallTypeDetailsStandard',
                text: 'Explain why you recommend this recall type',
                errorId: 'missingRecallTypeDetail',
              },
            ])
          })
        }

        if (flagFTR56Enabled) {
          describe('returns an error for the recall type, if not set', () => {
            ;[true, false].forEach(ftrMandatory => {
              ;[true, false].forEach(standardMandatory => {
                if (!(ftrMandatory && standardMandatory)) {
                  it(`FTR is Mandatory: ${ftrMandatory}, Standard is Mandatory: ${standardMandatory}`, async () => {
                    const requestBody = {
                      recallType: '',
                      crn: 'X34534',
                      ftrMandatory: ftrMandatory.toString(),
                      standardMandatory: standardMandatory.toString(),
                    }

                    const { errors, valuesToSave } = await validateRecallType({
                      requestBody,
                      recommendationId,
                      urlInfo,
                      flagFTR56Enabled,
                    })

                    expect(valuesToSave).toBeUndefined()
                    expect(errors).toEqual([
                      {
                        href: '#recallType',
                        name: 'recallType',
                        text: 'Select a recall recommendation',
                        errorId: 'noRecallTypeSelected',
                      },
                    ])
                  })
                }
              })
            })
          })
        } else {
          describe('returns an error for the recall type, if not set', () => {
            ;[true, false].forEach(ftrMandatory => {
              it(`FTR is Mandatory: ${ftrMandatory}`, async () => {
                const requestBody = {
                  recallType: '',
                  crn: 'X34534',
                  ftrMandatory: ftrMandatory.toString(),
                }

                const { errors, valuesToSave } = await validateRecallType({
                  requestBody,
                  recommendationId,
                  urlInfo,
                  flagFTR56Enabled,
                })

                expect(valuesToSave).toBeUndefined()
                expect(errors).toEqual([
                  {
                    href: '#recallType',
                    name: 'recallType',
                    text: ftrMandatory
                      ? "Select if you're recommending a fixed term recall or no recall"
                      : "Select if you're recommending a fixed term recall, standard recall or no recall",
                    errorId: ftrMandatory ? 'noRecallTypeSelectedMandatory' : 'noRecallTypeSelectedDiscretionary',
                  },
                ])
              })
            })
          })
        }

        it('errors if standard recall is selected whilst FTR is Mandatory', async () => {
          const requestBody = {
            recallType: 'STANDARD',
            crn: 'X34534',
            ftrMandatory: 'true',
            standardMandatory: 'false',
          }

          const { errors, valuesToSave, unsavedValues } = await validateRecallType({
            requestBody,
            recommendationId,
            urlInfo,
            flagFTR56Enabled,
          })

          expect(valuesToSave).toBeUndefined()
          expect(unsavedValues).toEqual({
            recallType: 'STANDARD',
          })
          expect(errors).toEqual([
            {
              href: '#recallType',
              name: 'recallType',
              text: flagFTR56Enabled
                ? 'Select a recall recommendation'
                : "Select if you're recommending a fixed term recall or no recall",
              errorId: flagFTR56Enabled ? 'noRecallTypeSelected' : 'noRecallTypeSelectedMandatory',
            },
          ])
        })

        // there's no such thing as mandatory standard recall pre-FTR56, so we only check for FTR56 cases here
        if (flagFTR56Enabled) {
          it('errors if fixed term recall is selected whilst Standard is Mandatory', async () => {
            const requestBody = {
              recallType: 'FIXED_TERM',
              crn: 'X34534',
              ftrMandatory: 'false',
              standardMandatory: 'true',
            }

            const { errors, valuesToSave, unsavedValues } = await validateRecallType({
              requestBody,
              recommendationId,
              urlInfo,
              flagFTR56Enabled,
            })

            expect(valuesToSave).toBeUndefined()
            expect(unsavedValues).toEqual({
              recallType: 'FIXED_TERM',
            })
            expect(errors).toEqual([
              {
                href: '#recallType',
                name: 'recallType',
                text: 'Select a recall recommendation',
                errorId: 'noRecallTypeSelected',
              },
            ])
          })
        }

        if (flagFTR56Enabled) {
          describe('returns an error, if recallType is set to an invalid value', () => {
            ;[true, false].forEach(ftrMandatory => {
              ;[true, false].forEach(standardMandatory => {
                if (!(ftrMandatory && standardMandatory)) {
                  it(`FTR is Mandatory: ${ftrMandatory}, Standard is Mandatory: ${standardMandatory}`, async () => {
                    const requestBody = {
                      recallType: 'VALUE',
                      crn: 'X34534',
                      ftrMandatory: ftrMandatory.toString(),
                      standardMandatory: standardMandatory.toString(),
                    }

                    const { errors, valuesToSave } = await validateRecallType({
                      requestBody,
                      recommendationId,
                      urlInfo,
                      flagFTR56Enabled,
                    })

                    expect(valuesToSave).toBeUndefined()
                    expect(errors).toEqual([
                      {
                        href: '#recallType',
                        name: 'recallType',
                        text: 'Select a recall recommendation',
                        errorId: 'noRecallTypeSelected',
                      },
                    ])
                  })
                }
              })
            })
          })
        } else {
          describe('returns an error, if recallType is set to an invalid value', () => {
            ;[true, false].forEach(ftrMandatory => {
              it(`FTR is Mandatory: ${ftrMandatory}`, async () => {
                const requestBody = {
                  recallType: 'VALUE',
                  crn: 'X34534',
                  ftrMandatory: ftrMandatory.toString(),
                }

                const { errors, valuesToSave } = await validateRecallType({
                  requestBody,
                  recommendationId,
                  urlInfo,
                  flagFTR56Enabled,
                })

                expect(valuesToSave).toBeUndefined()
                expect(errors).toEqual([
                  {
                    href: '#recallType',
                    name: 'recallType',
                    text: ftrMandatory
                      ? "Select if you're recommending a fixed term recall or no recall"
                      : "Select if you're recommending a fixed term recall, standard recall or no recall",
                    errorId: ftrMandatory ? 'noRecallTypeSelectedMandatory' : 'noRecallTypeSelectedDiscretionary',
                  },
                ])
              })
            })
          })
        }
      })
    })
  })
})
