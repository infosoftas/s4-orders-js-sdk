# Simple Orders App

This application contains an example of code for the Orders SDK usable to add orders for Tenants within INFO-Subscription. It is built with [React](https://react.dev/) and [Vite](https://vite.dev/).

## Requirements

Node 18 or higher.

## Installation

Install the package with:

```sh
npm install
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open [https://localhost:3000](https://localhost:3000) to view it in your browser.

The page will hot-reload when you make changes.

### `npm run build`

Builds the app for production to the `build/` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include hashes.\
Your app is ready to be deployed!

### `npm run preview`

Serves the production build locally for preview before deployment.

## Usage

In index.html configure order module, here example of configuration:

<!-- prettier-ignore -->
```js
import { orderComponent } from './script.js';
        const config = {
            modulaTitle: 'MyCompany',
            domElementId: 'order',
            redirectUrl: window.location.href,
            merchantAgreementUrl: "xxxx-xxxx-xxxx-xxxx",
            showIframe: true,
            apiKey: "xxxx-xxxx-xxxx-xxxx",
            apiUrl: "xxxx-xxxx-xxxx-xxxx",
            userId: "xxxx-xxxx-xxxx-xxxx",
            subscriberId: "xxxx-xxxx-xxxx-xxxx",
            templatePackageId: "xxxx-xxxx-xxxx-xxxx",
            identityProviderId: "xxxx-xxxx-xxxx-xxxx",
            organizationId: "xxxx-xxxx-xxxx-xxxx",
            language: 'en-US',
            availablePaymentMethods: [
                { label: "Vipps", value: "Vipps" },
                { label: "MobilePay", value: "MobilePay" },
                { label: "Credit Card/Debit Card", value: "SwedbankPay" },
                { label: 'Invoice', translateKey: 'Invoice', value: 'Invoice' },
                { label: 'Email', translateKey: 'Email', value: 'Email' },
                { label: 'EHF', translateKey: 'EHF', value: 'EHF' },
                { label: 'OIO', translateKey: 'OIO', value: 'OIO' },
            ],
            paymentMethodsOptions: {
                Vipps: {
                    generateSubscriberContact: true,
                    orderFormFields: [],
                },
                SwedbankPay: {
                    orderFormFields: [
                        {
                            name: 'name',
                            label: 'Name',
                            required: false,
                        },
                        {
                            name: 'phoneNumber',
                            label: 'Phone',
                            readOnly: false,
                            required: false,
                        },
                        {
                            name: 'email',
                            label: 'Email',
                            required: true,
                            readOnly: false,
                        },
                        {
                            name: 'country',
                            label: 'Country',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'city',
                            label: 'City',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'address',
                            label: 'Address',
                            required: false,
                            readOnly: false,
                        },
                    ],
                },
                Invoice: {
                    orderFormFields: [
                        {
                            name: 'country',
                            label: 'Country',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'city',
                            label: 'City',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'address',
                            label: 'Address',
                            required: false,
                            readOnly: false,
                        },
                    ],
                },
                Email: {
                    orderFormFields: [
                        {
                            name: 'country',
                            label: 'Country',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'city',
                            label: 'City',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'address',
                            label: 'Address',
                            required: false,
                            readOnly: false,
                        },
                    ],
                },
                EHF: {
                    orderFormFields: [
                        {
                            name: 'country',
                            label: 'Country',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'city',
                            label: 'City',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'address',
                            label: 'Address',
                            required: false,
                            readOnly: false,
                        },
                    ],
                },
                OIO: {
                    orderFormFields: [
                        {
                            name: 'country',
                            label: 'Country',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'city',
                            label: 'City',
                            required: false,
                            readOnly: false,
                        },
                        {
                            name: 'address',
                            label: 'Address',
                            required: false,
                            readOnly: false,
                        },
                    ],
                },
            },
            invoiceAddressSelection: {
                enabled: true,
                label: 'Invoice Address',
                fields: [{
                    name: 'invoiceEmail',
                    label: 'Email',
                    required: false,
                    readOnly: false,
                },],
            },
            settings: {
                submitButtonText: 'Continue',
                backButtonText: 'Back',
                verifyButtonText: 'Verify',
                organizationNumberLabel: 'CVR',
                glnLabel: 'GLN/EAN',
                paymentMethodLabel: 'Select Payment Method',
                errorReqMsg: 'This field is required!',
                errorInvalidEmailMsg: 'Invalid email address!',
                errorInvalidPhoneMsg: 'Invalid phone number!',
                successText: 'Order successful completed!',
                failureText: 'Something went wrong!',
                orderDefaultValues: {
                    name: '',
                    email: '',
                    phoneNumber: '',
                    paymentMethod: undefined,
                },
            }
        };

        let timer = setInterval(() => {
            let orderElement = document.getElementById('order');
            if (!orderElement) return;
            orderComponent?.remove();
            orderComponent.init(config);
            console.log('module init');
            clearInterval(timer);
        }, 300);
```
