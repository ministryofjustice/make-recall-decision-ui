import ppcsSearchController from '../../controllers/personSearch/ppcsSearchController'
import ppcsSearchResultsController from '../../controllers/personSearch/ppcsSearchResultsController'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import noPpcsSearchResultsController from '../../controllers/personSearch/noPpcsSearchResultsController'
import type { RouteDefinition } from '../standardRouter'
import { createRecommendationRouteTemplate, RECOMMENDATION_PREFIX } from '../recommendations'
import searchPpudController from '../../controllers/recommendation/searchPpudController'
import noSearchPpudResults from '../../controllers/recommendation/noSearchPpudResults'
import recommendationStatusCheck, { STATUSES } from '../../middleware/recommendationStatusCheck'
import { and, not, ppcsCustodyGroup, statusIsActive } from '../../middleware/check'
import searchPpudResultsController from '../../controllers/recommendation/searchPpudResultsController'
import checkBookingDetailsController from '../../controllers/recommendation/ppcs/checkBookingDetailsController'
import editPoliceContactController from '../../controllers/recommendation/editPoliceContactController'
import editRecallReceivedController from '../../controllers/recommendation/editRecallReceivedController'
import editPrisonBookingNumberController from '../../controllers/recommendation/editPrisonBookingNumberController'
import editNameController from '../../controllers/recommendation/editNameController'
import editCroController from '../../controllers/recommendation/editCroController'
import editCustodyGroupController from '../../controllers/recommendation/ppcs/custodyGroup/editCustodyGroupController'
import editCurrentEstablishmentController from '../../controllers/recommendation/ppcs/currentEstablishment/editCurrentEstablishmentController'
import editReleasingPrisonController from '../../controllers/recommendation/editReleasingPrisonController'
import editMappaLevelController from '../../controllers/recommendation/editMappaLevelController'
import editGenderController from '../../controllers/recommendation/editGenderController'
import editEthnicityController from '../../controllers/recommendation/editEthnicityController'
import editDateOfBirthController from '../../controllers/recommendation/editDateOfBirthController'
import editProbationAreaController from '../../controllers/recommendation/editProbationAreaController'
import editLegislationReleasedUnderController from '../../controllers/recommendation/editLegislationReleasedUnderController'
import supportingDocumentsController from '../../controllers/recommendation/supportingDocumentsController'
import supportingDocumentUploadController from '../../controllers/recommendation/supportingDocumentUploadController'
import additionalSupportingDocumentUploadController from '../../controllers/recommendation/additionalSupportingDocumentUploadController'
import additionalSupportingDocumentReplaceController from '../../controllers/recommendation/additionalSupportingDocumentReplaceController'
import additionalSupportingDocumentRemoveController from '../../controllers/recommendation/additionalSupportingDocumentRemoveController'
import editPpudMinuteController from '../../controllers/recommendation/editPpudMinuteController'
import supportingDocumentReplaceController from '../../controllers/recommendation/supportingDocumentReplaceController'
import supportingDocumentRemoveController from '../../controllers/recommendation/supportingDocumentRemoveController'
import supportingDocumentDownloadController from '../../controllers/recommendation/supportingDocumentDownloadController'
import { CUSTODY_GROUP } from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import selectIndexOffenceController from '../../controllers/recommendation/ppcs/determinateSentence/selectIndexOffenceController'
import consecutiveSentenceDetailsController from '../../controllers/recommendation/ppcs/determinateSentence/consecutiveSentenceDetailsController'
import matchIndexOffenceController from '../../controllers/recommendation/matchIndexOffenceController'
import selectPpudSentenceController from '../../controllers/recommendation/selectPpudSentenceController'
import editCustodyTypeController from '../../controllers/recommendation/editCustodyTypeController'
import sentenceToCommitController from '../../controllers/recommendation/ppcs/sentenceToCommit/sentenceToCommitController'
import sentenceToCommitExistingOffenderController from '../../controllers/recommendation/ppcs/sentenceToCommit/sentenceToCommitExistingOffenderController'
import selectIndeterminatePpudSentenceController from '../../controllers/recommendation/ppcs/indeterminateSentence/selectIndeterminatePpudSentenceController'
import sentenceToCommitIndeterminateController from '../../controllers/recommendation/ppcs/indeterminateSentence/sentenceToCommitIndeterminateController'
import editReleaseDateController from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editReleaseDateController'
import editDateOfSentenceController from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editDateOfSentenceController'
import determinateSentenceDetailsController from '../../controllers/recommendation/ppcs/determinateSentence/determinateSentenceDetailsController'
import bookedToPpudController from '../../controllers/recommendation/bookedToPpudController'
import bookToPpudController from '../../controllers/recommendation/bookToPpudController'
import bookingSummaryController from '../../controllers/recommendation/bookingSummaryController'
import editOffenceController from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editOffenceController'
import editSentencingCourt from '../../controllers/recommendation/ppcs/indeterminateSentence/edit/editSentencingCourt'
import { ppcsPaths } from '../paths/ppcs.paths'

const roles = { allow: [HMPPS_AUTH_ROLE.PPCS] }

const ppcsAfterSearchGetTemplate = createRecommendationRouteTemplate(
  'get',
  [
    recommendationStatusCheck(
      and(
        statusIsActive(STATUSES.SENT_TO_PPCS),
        not(statusIsActive(STATUSES.BOOKING_ON_STARTED)),
        not(statusIsActive(STATUSES.REC_CLOSED))
      )
    ),
  ],
  roles
)

const ppcsAfterSearchPostTemplate = createRecommendationRouteTemplate(
  'post',
  [
    recommendationStatusCheck(
      and(
        statusIsActive(STATUSES.SENT_TO_PPCS),
        not(statusIsActive(STATUSES.BOOKING_ON_STARTED)),
        not(statusIsActive(STATUSES.REC_CLOSED))
      )
    ),
  ],
  roles
)

const ppcsRecommendationRoutes: RouteDefinition[] = [
  {
    ...createRecommendationRouteTemplate('get', [], roles),
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.searchPpud}`,
    handler: searchPpudController.get,
  },
  {
    ...createRecommendationRouteTemplate('post', [], roles),
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.searchPpud}`,
    handler: searchPpudController.post,
  },
  {
    ...createRecommendationRouteTemplate('get', [], roles),
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.noSearchPpudResults}`,
    handler: noSearchPpudResults.get,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.searchPpudResults}`,
    handler: searchPpudResultsController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.searchPpudResults}`,
    handler: searchPpudResultsController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.checkBookingDetails}`,
    handler: checkBookingDetailsController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.checkBookingDetails}`,
    handler: checkBookingDetailsController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editPoliceContact}`,
    handler: editPoliceContactController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editPoliceContact}`,
    handler: editPoliceContactController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editRecallReceivedDateAndTime}`,
    handler: editRecallReceivedController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editRecallReceivedDateAndTime}`,
    handler: editRecallReceivedController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editPrisonBookingNumber}`,
    handler: editPrisonBookingNumberController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editPrisonBookingNumber}`,
    handler: editPrisonBookingNumberController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editName}`,
    handler: editNameController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editName}`,
    handler: editNameController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCro}`,
    handler: editCroController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCro}`,
    handler: editCroController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCustodyGroup}`,
    handler: editCustodyGroupController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCustodyGroup}`,
    handler: editCustodyGroupController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCurrentEstablishment}`,
    handler: editCurrentEstablishmentController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCurrentEstablishment}`,
    handler: editCurrentEstablishmentController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editReleasingPrison}`,
    handler: editReleasingPrisonController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editReleasingPrison}`,
    handler: editReleasingPrisonController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editMappaLevel}`,
    handler: editMappaLevelController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editMappaLevel}`,
    handler: editMappaLevelController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editGender}`,
    handler: editGenderController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editGender}`,
    handler: editGenderController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editEthnicity}`,
    handler: editEthnicityController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editEthnicity}`,
    handler: editEthnicityController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editDateOfBirth}`,
    handler: editDateOfBirthController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editDateOfBirth}`,
    handler: editDateOfBirthController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editProbationArea}`,
    handler: editProbationAreaController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editProbationArea}`,
    handler: editProbationAreaController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editLegislationReleasedUnder}`,
    handler: editLegislationReleasedUnderController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editLegislationReleasedUnder}`,
    handler: editLegislationReleasedUnderController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocuments}`,
    handler: supportingDocumentsController.get,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocumentUpload}`,
    handler: supportingDocumentUploadController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocumentUpload}`,
    handler: supportingDocumentUploadController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.additionalSupportingDocumentUpload}`,
    handler: additionalSupportingDocumentUploadController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.additionalSupportingDocumentUpload}`,
    handler: additionalSupportingDocumentUploadController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.additionalSupportingDocumentReplace}`,
    handler: additionalSupportingDocumentReplaceController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.additionalSupportingDocumentReplace}`,
    handler: additionalSupportingDocumentReplaceController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.additionalSupportingDocumentRemove}`,
    handler: additionalSupportingDocumentRemoveController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.additionalSupportingDocumentRemove}`,
    handler: additionalSupportingDocumentRemoveController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editPpudMinute}`,
    handler: editPpudMinuteController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editPpudMinute}`,
    handler: editPpudMinuteController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocumentReplace}`,
    handler: supportingDocumentReplaceController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocumentReplace}`,
    handler: supportingDocumentReplaceController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocumentRemove}`,
    handler: supportingDocumentRemoveController.get,
  },
  {
    ...ppcsAfterSearchPostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocumentRemove}`,
    handler: supportingDocumentRemoveController.post,
  },
  {
    ...ppcsAfterSearchGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.supportingDocumentDownload}`,
    handler: supportingDocumentDownloadController.get,
  },
]

const determinateSentenceMiddleware = [
  recommendationStatusCheck(
    and(
      statusIsActive(STATUSES.SENT_TO_PPCS),
      ppcsCustodyGroup(CUSTODY_GROUP.DETERMINATE),
      not(statusIsActive(STATUSES.BOOKING_ON_STARTED)),
      not(statusIsActive(STATUSES.REC_CLOSED))
    )
  ),
]
const ppcsDeterminateSentenceGetTemplate = createRecommendationRouteTemplate(
  'get',
  determinateSentenceMiddleware,
  roles
)
const ppcsDeterminateSentencePostTemplate = createRecommendationRouteTemplate(
  'post',
  determinateSentenceMiddleware,
  roles
)

const ppcsDeterminateSentenceRoutes: RouteDefinition[] = [
  {
    ...ppcsDeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.selectIndexOffence}`,
    handler: selectIndexOffenceController.get,
  },
  {
    ...ppcsDeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.selectIndexOffence}`,
    handler: selectIndexOffenceController.post,
  },
  {
    ...ppcsDeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.consecutiveSentenceDetails}`,
    handler: consecutiveSentenceDetailsController.get,
  },
  {
    ...ppcsDeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.matchIndexOffence}`,
    handler: matchIndexOffenceController.get,
  },
  {
    ...ppcsDeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.matchIndexOffence}`,
    handler: matchIndexOffenceController.post,
  },
  {
    ...ppcsDeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.selectPpudSentence}`,
    handler: selectPpudSentenceController.get,
  },
  {
    ...ppcsDeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.selectPpudSentence}`,
    handler: selectPpudSentenceController.post,
  },
  {
    ...ppcsDeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCustodyType}`,
    handler: editCustodyTypeController.get,
  },
  {
    ...ppcsDeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.editCustodyType}`,
    handler: editCustodyTypeController.post,
  },
  {
    ...ppcsDeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.sentenceToCommit}`,
    handler: sentenceToCommitController.get,
  },
  {
    ...ppcsDeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.sentenceToCommit}`,
    handler: sentenceToCommitController.post,
  },
  {
    ...ppcsDeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.sentenceToCommitExistingOffender}`,
    handler: sentenceToCommitExistingOffenderController.get,
  },
  {
    ...ppcsDeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.sentenceToCommitExistingOffender}`,
    handler: sentenceToCommitExistingOffenderController.post,
  },
]

const indeterminateSentenceMiddleware = [
  recommendationStatusCheck(
    and(
      statusIsActive(STATUSES.SENT_TO_PPCS),
      ppcsCustodyGroup(CUSTODY_GROUP.INDETERMINATE),
      not(statusIsActive(STATUSES.BOOKING_ON_STARTED)),
      not(statusIsActive(STATUSES.REC_CLOSED))
    )
  ),
]

const ppcsIndeterminateSentenceGetTemplate = createRecommendationRouteTemplate(
  'get',
  indeterminateSentenceMiddleware,
  roles
)
const ppcsIndeterminateSentencePostTemplate = createRecommendationRouteTemplate(
  'post',
  indeterminateSentenceMiddleware,
  roles
)

const ppcsIndeterminateSentenceRoutes: RouteDefinition[] = [
  {
    ...ppcsIndeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.selectIndeterminatePpudSentence}`,
    handler: selectIndeterminatePpudSentenceController.get,
  },
  {
    ...ppcsIndeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.selectIndeterminatePpudSentence}`,
    handler: selectIndeterminatePpudSentenceController.post,
  },
  {
    ...ppcsIndeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.sentenceToCommitIndeterminate}`,
    handler: sentenceToCommitIndeterminateController.get,
  },
  {
    ...ppcsIndeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.sentenceToCommitIndeterminate}`,
    handler: sentenceToCommitIndeterminateController.post,
  },
  {
    ...ppcsIndeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.releaseDate}`,
    handler: editReleaseDateController.get,
  },
  {
    ...ppcsIndeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.releaseDate}`,
    handler: editReleaseDateController.post,
  },
  {
    ...ppcsIndeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.offenceDescription}`,
    handler: editOffenceController.get,
  },
  {
    ...ppcsIndeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.offenceDescription}`,
    handler: editOffenceController.post,
  },
  {
    ...ppcsIndeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.sentencingCourt}`,
    handler: editSentencingCourt.get,
  },
  {
    ...ppcsIndeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.sentencingCourt}`,
    handler: editSentencingCourt.post,
  },
  {
    ...ppcsIndeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.dateOfSentence}`,
    handler: editDateOfSentenceController.get,
  },
  {
    ...ppcsIndeterminateSentencePostTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.indeterminateEdit.dateOfSentence}`,
    handler: editDateOfSentenceController.post,
  },
  {
    ...ppcsIndeterminateSentenceGetTemplate,
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.determinatePpudSentences}`,
    handler: determinateSentenceDetailsController.get,
  },
]

const bookingMiddleware = [
  recommendationStatusCheck(and(statusIsActive(STATUSES.SENT_TO_PPCS), not(statusIsActive(STATUSES.REC_CLOSED)))),
]

const ppcsBookingRoutes: RouteDefinition[] = [
  {
    ...createRecommendationRouteTemplate('get', bookingMiddleware, roles),
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.bookToPpud}`,
    handler: bookToPpudController.get,
  },
  {
    ...createRecommendationRouteTemplate('post', bookingMiddleware, roles),
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.bookToPpud}`,
    handler: bookToPpudController.post,
  },
  {
    ...createRecommendationRouteTemplate('get', bookingMiddleware, roles),
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.bookingSummary}`,
    handler: bookingSummaryController.get,
  },
]

export const ppcsRoutes: RouteDefinition[] = [
  {
    path: `/${ppcsPaths.search}`,
    method: 'get',
    handler: ppcsSearchController.get,
    roles,
    additionalMiddleware: [],
  },
  {
    path: `/${ppcsPaths.searchResults}`,
    method: 'get',
    handler: ppcsSearchResultsController.get,
    roles,
    additionalMiddleware: [],
  },
  {
    path: `/${ppcsPaths.noSearchResults}`,
    method: 'get',
    handler: noPpcsSearchResultsController.get,
    roles,
    additionalMiddleware: [],
  },
  {
    ...createRecommendationRouteTemplate(
      'get',
      [recommendationStatusCheck(statusIsActive(STATUSES.BOOKED_TO_PPUD))],
      roles
    ),
    path: `${RECOMMENDATION_PREFIX}/${ppcsPaths.bookedToPpud}`,
    method: 'get',
    handler: bookedToPpudController.get,
  },
  ...ppcsRecommendationRoutes,
  ...ppcsDeterminateSentenceRoutes,
  ...ppcsIndeterminateSentenceRoutes,
  ...ppcsBookingRoutes,
]
