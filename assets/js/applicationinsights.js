window.applicationInsights = (function () {
  let appInsights

  return {
    init: (connectionString, applicationInsightsRoleName, authenticatedUser) => {
      if (!appInsights && connectionString) {
        appInsights = new Microsoft.ApplicationInsights.ApplicationInsights({
          config: {
            connectionString,
            autoTrackPageVisitTime: true,
          },
        })
        appInsights.addTelemetryInitializer(envelope => {
          envelope.tags['ai.cloud.role'] = applicationInsightsRoleName
        })
        appInsights.setAuthenticatedUserContext(authenticatedUser)
        appInsights.loadAppInsights()
        appInsights.trackPageView()
      }
    },
  }
})()
