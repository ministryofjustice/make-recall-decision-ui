# Google analytics

This app uses [a Google tag manager container](https://tagmanager.google.com/?authuser=1#/container/accounts/4429862879/containers/95433884/workspaces/20) within the DPS account.

The container is used for all environments and forwards events to separate GA4 properties for [preprod](https://analytics.google.com/analytics/web/?authuser=0#/p328727206/reports/intelligenthome) and [prod](https://analytics.google.com/analytics/web/?authuser=0#/analysis/p328735380/edit/r_8MbmLKTLWdSiHAbnscaQ) using a lookup table variable, which forwards to the correct property based on the hostname of the event.

Wherever possible, GTM tags should be used to create GA4 events. If this isn't practical for a given case, there's a [analytics.js](../assets/js/analytics.js) file which can be used for custom code.

## Metadata for GTM events

If setting up a new GTM tag for an event such as a click or element becoming visibile, the general technique which requires the least maintenance / changes, is to add, in the Nunjucks template, one or more of the following attributes to the element that triggers the event:
- data-analytics-event 
- data-analytics-event-category
- data-analytics-event-label

Then, in GTM, use the 'auto-event' variables to map those values to event parameters.