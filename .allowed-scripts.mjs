import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
   allowlist: {
     "node_modules/cypress@13.7.2": "ALLOW",
     "node_modules/dtrace-provider@0.8.8": "ALLOW",
     "node_modules/fsevents@2.3.3": "ALLOW"
   },
})
