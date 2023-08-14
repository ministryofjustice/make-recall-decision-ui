import { NextFunction, Request, Response } from 'express'
import { getCaseSummaryV2, updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { inputDisplayValuesLicenceConditions } from '../recommendations/licenceConditions/inputDisplayValues'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'
import { validateLicenceConditionsBreached } from '../recommendations/licenceConditions/formValidator'
import { CaseSummaryOverviewResponseV2 } from '../../@types/make-recall-decision-api/models/CaseSummaryOverviewResponseV2'
import { formOptions } from '../recommendations/formOptions/formOptions'
import { isDefined } from '../../utils/utils'
import { makeErrorObject } from '../../utils/errors'
import { strings } from '../../textStrings/en'

const makeArray = (item: unknown) => (Array.isArray(item) ? item : [item])

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
    flags: featureFlags,
  } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'licenceConditions',
    },
    inputDisplayValues: inputDisplayValuesLicenceConditions({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recommendation,
    }),
  }

  if (featureFlags.flagCvl) {
    const json = await getCaseSummaryV2<CaseSummaryOverviewResponseV2>(recommendation.crn, 'licence-conditions', token)

    res.locals.caseSummary = {
      ...json,
      licenceConvictions: {
        activeCustodial: json.activeConvictions.filter(
          conviction => conviction.sentence && conviction.sentence.isCustodial
        ),
        hasMultipleActiveCustodial:
          json.activeConvictions.filter(conviction => conviction.sentence?.isCustodial).length > 1,
      },
      standardLicenceConditions: formOptions.standardLicenceConditions,
    }
  } else {
    res.locals.caseSummary = await fetchAndTransformLicenceConditions({
      crn: recommendation.crn,
      token,
    })
  }
  res.render(`pages/recommendations/licenceConditions`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    flags: featureFlags,
    urlInfo,
  } = res.locals

  const json =
    featureFlags.flagCvl &&
    (await getCaseSummaryV2<CaseSummaryOverviewResponseV2>(req.body.crn, 'licence-conditions', token))

  const cvlLicence = !!json?.cvlLicence
  let errors = []
  let valuesToSave
  let unsavedValues
  if (cvlLicence) {
    const { licenceConditionsBreached } = req.body
    const allSelectedConditions = isDefined(licenceConditionsBreached) ? makeArray(licenceConditionsBreached) : []

    const selectedStandardConditions = allSelectedConditions
      .filter(item => item.startsWith('standard|'))
      .map(item => item.replace('standard|', ''))

    const selectedAdditionalLicenceConditions = allSelectedConditions
      .filter(item => item.startsWith('additional|'))
      .map(item => item.replace('additional|', ''))

    const selectedBespokeLicenceConditions = allSelectedConditions
      .filter(item => item.startsWith('bespoke|'))
      .map(item => item.replace('bespoke|', ''))

    if (allSelectedConditions.length === 0) {
      errors.push(
        makeErrorObject({
          id: 'licenceConditionsBreached',
          text: strings.errors.noLicenceConditionsSelected,
          errorId: 'noLicenceConditionsSelected',
        })
      )
    } else {
      valuesToSave = {
        cvlLicenceConditionsBreached: {
          standardLicenceConditions: {
            selected: selectedStandardConditions,
            allOptions: json.cvlLicence.standardLicenceConditions.map(condition => ({
              code: condition.code,
              text: condition.text,
            })),
          },
          additionalLicenceConditions: {
            selected: selectedAdditionalLicenceConditions,
            allOptions: json.cvlLicence.additionalLicenceConditions.map(condition => ({
              code: condition.code,
              text: condition.text,
            })),
          },
          bespokeLicenceConditions: {
            selected: selectedBespokeLicenceConditions,
            allOptions: json.cvlLicence.bespokeConditions.map(condition => ({
              code: condition.code,
              text: condition.text,
            })),
          },
        },
      }
    }
  } else {
    const response = await validateLicenceConditionsBreached({
      requestBody: req.body,
      recommendationId,
      urlInfo,
      token,
    })

    errors = response.errors
    valuesToSave = response.valuesToSave
    unsavedValues = response.unsavedValues
  }

  if (errors && errors.length > 0) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }
  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'task-list-consider-recall', urlInfo }))
}

export default { get, post }
