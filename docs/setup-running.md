# Running the app locally

## Setup

Use the version of Node specified in the package.json 'engines' property.
Install dependencies using `npm install`.

Take a copy of the .env.dev.sample file in the root of this repo.
Name the copy as .env, then set API_CLIENT_ID to your client ID and API_CLIENT_SECRET to your client secret.  NOTE - don't wrap client secrets in quotes.
[How to request client ID and secret](https://github.com/ministryofjustice/hmpps-auth#how-do-i-get-client-credentials)).

Next, in your shell config eg ~/.zshrc, set:
```
export SYSTEM_CLIENT_ID=<the value of API_CLIENT_ID>
export SYSTEM_CLIENT_SECRET='the value of API_CLIENT_SECRET, in single quotes'
```

You will also need a [NDelius user login](./user-access.md) to sign in to the app.

## Run against dev env services

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