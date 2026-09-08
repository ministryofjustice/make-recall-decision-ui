import { Router } from 'express'
import multer from 'multer'
import supportingDocumentsController from '../controllers/recommendation/supportingDocumentsController'

export default function multiPartRoutes(router: Router) {
  const upload = multer()

  router.post(
    '/recommendations/:recommendationId/supporting-documents',
    upload.array('documents'),
    supportingDocumentsController.post,
  )

  return router
}
