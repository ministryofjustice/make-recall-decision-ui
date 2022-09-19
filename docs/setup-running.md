## Running the app locally against dev env services

### Setup

Install dependencies using `npm install`, ensuring you are using Node v16.x

There are 2 .env sample files depending on what you are trying to do:
- To run the setup pointing at local services, then use the .env.local.sample file in the root of this repo
- To run the setup pointing at dev services, then use the .env.dev.sample file in the root of this repo

Name the copy as .env, then complete with the missing env values (the team will provide them). NOTE - don't wrap client secrets in quotes.

In your shell config eg .zshrc, set:
```
export SYSTEM_CLIENT_ID=<YOUR DEV CLIENT ID, USUALLY YOUR NAME>
export SYSTEM_CLIENT_SECRET='<YOUR DEV CLIENT SECRET, INSIDE SINGLE QUOTES>'
```

### Run against dev env

NOTE - you should be connected to the MoJ digital VPN, because you'll be connecting to services in dev env.

To start the API and local dependencies, excluding the UI:

```
./scripts/start-services-no-ui.sh
```

And then, to start the UI app:

```
npm run start:dev
```

Then log in with your Delius credentials (for dev environment).

This will build the `hmpps-auth` container image locally on your machine before starting things up. This is needed as the currently released container for `hmpps-auth` does not run properly on M1 macs.
