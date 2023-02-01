# Analytics

AppInsights and GA / GTM are used. See [notes on Confluence](https://dsdmoj.atlassian.net/wiki/spaces/MRD/pages/4293394509/Product+analytics)

## Metadata for GTM events

If setting up a new GTM tag for an event such as a click or element becoming visibile, the general technique which requires the least maintenance / changes, is to add, in the Nunjucks template, one or more of the following attributes to the element that triggers the event:
- data-analytics-event 
- data-analytics-event-category
- data-analytics-event-label

Then, in GTM, use the 'auto-event' variables to map those values to event parameters.