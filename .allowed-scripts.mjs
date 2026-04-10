import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    // Needed by esbuild for watching files during development
    'node_modules/@parcel/watcher@2.5.6': 'ALLOW',
    'node_modules/cypress@14.5.4': 'ALLOW',
    'node_modules/dtrace-provider@0.8.8': 'ALLOW',
    'node_modules/fsevents@2.3.3': 'ALLOW',
    // Native solution to quickly resolve module paths, used by jest and eslint
    'node_modules/unrs-resolver@1.11.1': 'ALLOW',
  },
})
