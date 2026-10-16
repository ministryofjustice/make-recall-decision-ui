export default {
  PO: {
    username: process.env.PLAYWRIGHT_USERNAME_PO ?? '',
    password: process.env.PLAYWRIGHT_PASSWORD_PO ?? '',
  },
  SPO: {
    username: process.env.PLAYWRIGHT_USERNAME_SPO ?? '',
    password: process.env.PLAYWRIGHT_PASSWORD_SPO ?? '',
  },
  ACO: {
    username: process.env.PLAYWRIGHT_USERNAME_ACO ?? '',
    password: process.env.PLAYWRIGHT_PASSWORD_ACO ?? '',
  },
  PPCS: {
    username: process.env.PLAYWRIGHT_USERNAME_PPCS ?? '',
    password: process.env.PLAYWRIGHT_PASSWORD_PPCS ?? '',
  },
}
