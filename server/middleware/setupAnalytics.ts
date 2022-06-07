import express, { Router } from 'express'

export default function setupAnalytics(): Router {
  const router = express.Router()
  router.use((req, res, next) => {
    if (res.locals.env === 'test') {
      res.locals.googleAnalyticsId = 'UA-123456789-00'
    }
    if (res.locals.env === 'PRODUCTION') {
      res.locals.googleAnalyticsId = 'UA-106741063-23'
    }
    if (res.locals.env === 'PRE-PRODUCTION') {
      res.locals.googleAnalyticsId = 'UA-106741063-22'
    }
    next()
  })
  return router
}
