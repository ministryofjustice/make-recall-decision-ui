// So here we're looking to try and load a bunch of modules and return a bunch of config for them
// So it needs to loook for:
// 1) routes,
// 2) middleware
// 3) views? We need to do the nunjucksSetup at some point
// 4) bind handlers (With correct middleware)

import TestModule from '../pages/TestModule'

export default function ModuleLoader() {
  const routes = [...TestModule.routes]
  const paths = [TestModule.path]

  return {
    paths,
    routes,
  }
}
