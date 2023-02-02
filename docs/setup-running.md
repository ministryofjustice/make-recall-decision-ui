# Running the app locally

## Setup

Use the version of Node specified in the package.json 'engines' property.
Install dependencies using `npm install`.

## Run against dev env services
Take a copy of the .env.dev.sample file in the root of this repo. 
Name the copy as .env, then complete with the missing env values (the team will provide them). NOTE - don't wrap client secrets in quotes.

In your shell config eg .zshrc, set:
```
export SYSTEM_CLIENT_ID=<YOUR DEV CLIENT ID, USUALLY YOUR NAME>
export SYSTEM_CLIENT_SECRET='<YOUR DEV CLIENT SECRET, INSIDE SINGLE QUOTES>'
```

NOTE - you should be connected to the MoJ digital VPN, to authenticate against HMPPS Auth in dev env.

To start the API and local dependencies, excluding the UI:

```
./scripts/start-services-no-ui.sh
```

And then, to start the UI app:

```
npm run start:dev
```

Then log in with your NDelius credentials (for dev environment). [Notes on obtaining a login](./user-access.md).

## Run against local containers
It's also possible to run locally against all services including auth, in containers. See [E2E tests](./e2e-tests.md).