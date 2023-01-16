# User access to the app

## Getting a user set up
Request a new NDelius user (for prod env, use Service Now). Ensure the user has the role MRDBT001. You use the same credentials to log in to both NDelius and this app.

## User roles
* Probation Officer (PO) - will have the NDelius role MRDBT001
* Senior Probation Officer (SPO) will have the NDelius roles MRDBT001 and MRDBT002

## IP whitelisting
If the user logs in to the HMPPS apps dashboard, but gets 403 when they click on the application tile for 'Make recall decisions', check if their IP address needs adding to the list ([production list](https://github.com/ministryofjustice/make-recall-decision-ui/blob/pen-test-ip-allow-list/helm_deploy/values-prod.yaml))