import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { makeErrorObject } from '../../../../utils/errors'
import { strings } from '../../../../textStrings/en'
import { CUSTODY_GROUP } from '../../../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import { BookRecallToPpud } from '../../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { getCustodyGroup } from '../../../../helpers/ppudSentence/ppudSentenceHelper'

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

  let errorId
  if (custodyGroup === undefined) {
    errorId = 'missingCustodyGroup'
  } else {
    const custodyGroups: CUSTODY_GROUP[] = Object.values(CUSTODY_GROUP)
    if (!custodyGroups.includes(custodyGroup)) {
      errorId = 'invalidCustodyGroup'
    }
  }

  if (errorId) {
    const error = makeErrorObject({
      id: 'custodyGroup',
      text: strings.errors[errorId],
      errorId,
    })
    req.session.errors = [error]
    return res.redirect(303, req.originalUrl)
  }

  let { bookRecallToPpud } = recommendation

  if (bookRecallToPpud.custodyGroup !== custodyGroup) {
    let valuesToSave

    // If there was a defined and different value before, we delete any offence
    // and sentence data that may have been set previously (e.g. if the user
    // had selected a custody group and down the corresponding pages for selecting
    // the PPUD sentence to update). This is to ensure we don't accidentally book
    // data that is no longer valid/relevant
    if (bookRecallToPpud.custodyGroup !== undefined) {
      bookRecallToPpud = removeOffenceAndSentenceData(bookRecallToPpud)
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

function removeOffenceAndSentenceData(bookRecallToPpud: BookRecallToPpud): BookRecallToPpud {
  const bookRecallToPpudCopy = bookRecallToPpud
  delete bookRecallToPpudCopy.sentenceDate
  delete bookRecallToPpudCopy.indexOffence
  delete bookRecallToPpudCopy.indexOffenceComment
  delete bookRecallToPpudCopy.ppudSentenceId
  delete bookRecallToPpudCopy.custodyType
  return bookRecallToPpudCopy
}

export default { get, post }
