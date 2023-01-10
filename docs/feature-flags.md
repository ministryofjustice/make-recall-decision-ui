# Feature flags

The app uses feature flags as a way to enable / disable user-facing features. They let us deploy features to production and evaluate them eg in user research, before enabling for all users.

The feature flags page is viewable at the `/flags` route on the app.

Each flag is set to on or off by default. A user can override the setting for their current browser only (it stores the override value in a cookie).

Flags can be added / changed in [feature-flags.ts](../server/middleware/featureFlags.ts). Create the flag and set to false. It will automatically be added to `res.locals.flags`.

A flag can be set when visiting any page by adding `?<featureFlagName>=1` to the URL. Good for setting flags for integration / E2E tests without having to get the test to visit the /flags page.
