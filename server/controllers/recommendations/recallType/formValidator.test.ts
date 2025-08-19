import { validateRecallType } from './formValidator'
import { formOptions } from '../formOptions/formOptions'
import { EVENTS } from '../../../utils/constants'

describe('validateRecallType', () => {
  const recommendationId = '456'
  const urlInfo = {
    currentPageId: 'recall-type',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/recall-type`,
  }

  describe('valid', () => {
    it('returns valuesToSave, sets isThisAnEmergencyRecall to false if valid fixed term recall selected', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'FIXED_TERM',
            details: requestBody.recallTypeDetailsFixedTerm,
          },
          allOptions: formOptions.recallType,
        },
        isThisAnEmergencyRecall: false,
      })
    })

    it('returns valuesToSave, sets isThisAnEmergencyRecall to null if valid fixed term recall selected and fromPageId is task list and value changed', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const urlInfoCopy = { ...urlInfo, fromPageId: 'task-list' }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo: urlInfoCopy })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'FIXED_TERM',
            details: requestBody.recallTypeDetailsFixedTerm,
          },
          allOptions: formOptions.recallType,
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
      }
      const urlInfoCopy = { ...urlInfo, fromPageId: 'task-list' }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo: urlInfoCopy })
      expect(errors).toBeUndefined()
      expect(valuesToSave.isThisAnEmergencyRecall).toBeUndefined()
    })

    it('returns monitoring event data', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { monitoringEvent } = await validateRecallType({ requestBody, recommendationId, urlInfo })
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
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'STANDARD',
            details: 'I recommend standard recall...',
          },
          allOptions: formOptions.recallType,
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
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo })
      expect(errors).toBeUndefined()
      expect(valuesToSave.isThisAnEmergencyRecall).toBeUndefined()
    })

    it('returns valuesToSave and no errors if valid no recall selected', async () => {
      const requestBody = {
        recallType: 'NO_RECALL',
        crn: 'X34534',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo })
      expect(errors).toBeUndefined()
      expect(valuesToSave).toEqual({
        recallType: {
          selected: {
            value: 'NO_RECALL',
          },
          allOptions: formOptions.recallType,
        },
        isThisAnEmergencyRecall: null,
      })
    })

    it('returns no isThisAnEmergencyRecall if recall type is set to NO_RECALL and is not changed', async () => {
      const requestBody = {
        recallType: 'NO_RECALL',
        crn: 'X34534',
        originalRecallType: 'NO_RECALL',
      }
      const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo })
      expect(errors).toBeUndefined()
      expect(valuesToSave.isThisAnEmergencyRecall).toBeUndefined()
    })

    it('returns no missingRecallTypeDetail if fixed term recall is selected but no details sent whilst FTR is Mandatory', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsFixedTerm: ' ', // whitespace
        crn: 'X34534',
        ftrMandatory: 'true',
      }
      const { errors, valuesToSave } = await validateRecallType({
        requestBody,
        recommendationId,
        urlInfo,
      })
      expect(valuesToSave?.recallType).toBeDefined()
      expect(errors).toBeUndefined()
    })

    describe('Redirects', () => {
      it('redirects to emergency recall if Fixed term recall is selected', async () => {
        const requestBody = {
          recallType: 'FIXED_TERM',
          recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
          crn: 'X34534',
        }
        const { nextPagePath } = await validateRecallType({ requestBody, recommendationId, urlInfo })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
      })

      it('redirects to emergency recall if Standard recall is selected', async () => {
        const requestBody = {
          recallType: 'STANDARD',
          recallTypeDetailsStandard: 'I recommend fixed term recall...',
          crn: 'X34534',
        }
        const { nextPagePath } = await validateRecallType({ requestBody, recommendationId, urlInfo })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
      })

      it('redirects to no recall letter page if No recall is selected', async () => {
        const requestBody = {
          recallType: 'NO_RECALL',
          crn: 'X34534',
        }
        const { nextPagePath } = await validateRecallType({ requestBody, recommendationId, urlInfo })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall`)
      })

      it('if "from page" is set, ignore it if a fixed term recall is selected', async () => {
        const requestBody = {
          recallType: 'FIXED_TERM',
          recallTypeDetailsFixedTerm: 'I recommend fixed term recall...',
          crn: 'X34534',
        }
        const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }
        const { nextPagePath } = await validateRecallType({
          requestBody,
          recommendationId,
          urlInfo: urlInfoWithFromPage,
        })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
      })

      it('if "from page" is set, ignore it if a standard recall is selected', async () => {
        const requestBody = {
          recallType: 'STANDARD',
          recallTypeDetailsStandard: 'I recommend standard recall...',
          crn: 'X34534',
        }
        const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }
        const { nextPagePath } = await validateRecallType({
          requestBody,
          recommendationId,
          urlInfo: urlInfoWithFromPage,
        })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/emergency-recall`)
      })

      it('if "from page" is set, ignore it if No recall is selected', async () => {
        const requestBody = {
          recallType: 'NO_RECALL',
          crn: 'X34534',
        }
        const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-recommendation' }
        const { nextPagePath } = await validateRecallType({
          requestBody,
          recommendationId,
          urlInfo: urlInfoWithFromPage,
        })
        expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list-no-recall`)
      })
    })
  })

  describe('invalid', () => {
    it('errors if fixed term recall is selected but standard detail sent', async () => {
      const requestBody = {
        recallType: 'FIXED_TERM',
        recallTypeDetailsStandard: 'I recommend fixed term recall...',
        crn: 'X34534',
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({
        requestBody,
        recommendationId,
        urlInfo,
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
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({
        requestBody,
        recommendationId,
        urlInfo,
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
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({
        requestBody,
        recommendationId,
        urlInfo,
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

    it('errors if standard recall is selected but no detail sent whilst FTR is Discretionary', async () => {
      const requestBody = {
        recallType: 'STANDARD',
        recallTypeDetailsStandard: '',
        crn: 'X34534',
        ftrMandatory: 'false',
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({
        requestBody,
        recommendationId,
        urlInfo,
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

    describe('returns an error for the recall type, if not set', () => {
      ;[true, false].forEach(ftrMandatory => {
        it(`FTR is Mandatory: ${ftrMandatory}`, async () => {
          const requestBody = {
            recallType: '',
            crn: 'X34534',
            ftrMandatory: ftrMandatory.toString(),
          }
          const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo })
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

    it('errors if standard recall is selected whilst FTR is Mandatory', async () => {
      const requestBody = {
        recallType: 'STANDARD',
        crn: 'X34534',
        ftrMandatory: 'true',
      }
      const { errors, valuesToSave, unsavedValues } = await validateRecallType({
        requestBody,
        recommendationId,
        urlInfo,
      })
      expect(valuesToSave).toBeUndefined()
      expect(unsavedValues).toEqual({
        recallType: 'STANDARD',
      })
      expect(errors).toEqual([
        {
          href: '#recallType',
          name: 'recallType',
          text: "Select if you're recommending a fixed term recall or no recall",
          errorId: 'noRecallTypeSelectedMandatory',
        },
      ])
    })

    describe('returns an error, if recallType is set to an invalid value', () => {
      ;[true, false].forEach(ftrMandatory => {
        it(`FTR is Mandatory: ${ftrMandatory}`, async () => {
          const requestBody = {
            recallType: 'VALUE',
            crn: 'X34534',
            ftrMandatory: ftrMandatory.toString(),
          }
          const { errors, valuesToSave } = await validateRecallType({ requestBody, recommendationId, urlInfo })
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
  })
})
