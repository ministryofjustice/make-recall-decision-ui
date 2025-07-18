import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { CUSTODY_GROUP } from '../../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { BookRecallToPpud } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { getCustodyGroup } from '../../../../helpers/ppudSentence/ppudSentenceHelper'
import { determineErrorId, reloadPageWithError } from '../validation/fieldValidation'

async function get(req: Request, res: Response, next: NextFunction) {
  const pageData = {
    custodyGroups: Object.values(CUSTODY_GROUP),
    selectedCustodyGroup: res.locals.recommendation.bookRecallToPpud.custodyGroup,
    partACustodyGroup: getCustodyGroup(res.locals.recommendation),
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'editCustodyGroup',
    },
    editCustodyGroupPageData: pageData,
  }

  res.render(`pages/recommendations/ppcs/editCustodyGroup`)
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { custodyGroup } = req.body
  const { recommendation } = res.locals

  const errorId = determineErrorId(custodyGroup, 'CustodyGroup', Object.values(CUSTODY_GROUP))

  if (errorId) {
    reloadPageWithError(errorId, 'custodyGroup', req, res)
  } else {
    const { bookRecallToPpud } = recommendation

    if (bookRecallToPpud.custodyGroup !== custodyGroup) {
      let valuesToSave

      // If there was a defined and different value before, we delete any offence
      // and sentence data that may have been set previously (e.g. if the user
      // had selected a custody group and down the corresponding pages for selecting
      // the PPUD sentence to update). This is to ensure we don't accidentally book
      // data that is no longer valid/relevant
      if (bookRecallToPpud.custodyGroup !== undefined) {
        removeOffenceAndSentenceData(bookRecallToPpud)
        valuesToSave = {
          nomisIndexOffence: {},
        }
      }

      valuesToSave = {
        ...valuesToSave,
        bookRecallToPpud,
      }

      // TODO MRD-2703 This is a temporary measure to ensure we can still go through the determinate path
      //      and create new determinate sentences. Otherwise, the user would be unable to set the custody
      //      type. To be removed once custody type editing is possible for new determinate sentences
      if (custodyGroup === CUSTODY_GROUP.DETERMINATE) {
        valuesToSave.bookRecallToPpud.custodyType = custodyGroup
      }

      valuesToSave.bookRecallToPpud.custodyGroup = custodyGroup

      await updateRecommendation({
        recommendationId: recommendation.id,
        valuesToSave,
        featureFlags: res.locals.flags,
        token: res.locals.user.token,
      })
    }

    const nextPagePath = nextPageLinkUrl({ nextPageId: 'check-booking-details', urlInfo: res.locals.urlInfo })
    res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo: res.locals.urlInfo }))
  }
}

function removeOffenceAndSentenceData(bookRecallToPpud: BookRecallToPpud) {
  /* eslint-disable no-param-reassign */
  delete bookRecallToPpud.sentenceDate
  delete bookRecallToPpud.indexOffence
  delete bookRecallToPpud.indexOffenceComment
  delete bookRecallToPpud.ppudIndeterminateSentenceId
  delete bookRecallToPpud.ppudIndeterminateSentenceData
  delete bookRecallToPpud.custodyType
  /* eslint-enable no-param-reassign */
}

export default { get, post }
