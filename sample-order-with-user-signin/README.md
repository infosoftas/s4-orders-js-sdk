# INFO-Subcription Orders SDK

This application contains example of code for the Orders SDK usable to add orders for Tenants within INFO-Subscription.

## Requirements

Node 18 or higher.

## Installation

Install the package with:

```sh
npm install
```

## Usage

The package needs to be configured with your properties which you find in env, env exist for 3 environments(dev, qa and production):

<!-- prettier-ignore -->
```js
PUBLIC_URL=/
API_URL="xxxx-xxxx-xxxx-xxxx"
API_KEY="xxxx-xxxx-xxxx-xxxx"
ORDER_SDK_API_URL="xxxx-xxxx-xxxx-xxxx"
AUTH_TYPE='popup' | 'redirect'
AUTHORITY="xxxx-xxxx-xxxx-xxxx"
SIGN_UP_AUTHORITY="xxxx-xxxx-xxxx-xxxx"
SIGN_IN_AUTHORITY="xxxx-xxxx-xxxx-xxxx"
CLIENT_ID="xxxx-xxxx-xxxx-xxxx"
KNOWN_AUTHORITIES="xxxx-xxxx-xxxx-xxxx"
IDENTITY_PROVIDER_ID="xxxx-xxxx-xxxx-xxxx"
TEMPLATE_PACKAGE_ID="xxxx-xxxx-xxxx-xxxx"
SELF_SERVICE_URL="xxxx-xxxx-xxxx-xxxx"
ORGANIZATION_ID="xxxx-xxxx-xxxx-xxxx"
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
