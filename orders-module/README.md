# INFO-Subscription JS/TS Order SDK

This repository contains code for the Orders SDK usable to add orders for Tenants within INFO-Subscription.

## Installation

Install the package with:

```sh
npm install @infosoftas/s4-orders-js-sdk
```

## Available Scripts

In the project directory, you can run:

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Usage

The package needs to be configured with configuration object:

<!-- prettier-ignore -->
```ts

enum PaymentMethodEnum {
    Vipps = 'Vipps',
    MobilePay = 'MobilePay',
    SwedbankPay = 'SwedbankPay',
    Invoice = 'Invoice',
    Email = 'Email',
    EHF = 'EHF',
    OIO = 'OIO',
}

type OrderFormFiledType = {
    name: string;
    required?: boolean;
};

type PaymentMethodOptionsType = {
    [key in PaymentMethodEnum]: {
        generateSubscriberContact?: boolean;
        accountId?: string;
        orderFormFields?: OrderFormFiledType[] | never[];
        paymentInvoiceFields?: OrderFormFiledType[] | never[] | null;
    };
}

type OrderFormInputsType = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    paymentMethod?: PaymentMethodEnum;
    country?: string;
    city?: string;
    address?: string;
    zip?: string;
};

enum UserActionEnum {
    SELECT_FORM = 'selectForm',
    SELECT_PAYMENT_METHOD = 'selectPaymentMethod',
    RETURN_TO_MAIN = 'returnToMain',
}

type ConfigType = {
    domElementId: string;
    moduleTitle?: string;
    submitStartCallback?: (subscriberId: string) => void;
    userActionCallback?: (action: UserActionEnum, args: object | null | undefined) => void;
    apiKey: string;
    apiUrl: string;
    templatePackageId: string;
    subscriberId: string;
    userId: string;
    identityProviderId: string;
    organizationId: string;
    redirectUrl?: string;
    showIframe?: boolean;
    availablePaymentMethods?: { label: string; value: PaymentMethodEnum }[];
    paymentMethodsOptions?: PaymentMethodOptionsType;
    language?: string;
    merchantAgreementUrl?: string;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFiledType[] | never[];
    };
    settings?: {
        successText?: string;
        failureText?: string;
        submitButtonText?: string;
        backButtonText?: string;
        verifyButtonText?: string;
        organizationNumberLabel?: string;
        glnLabel?: string;
        orderDefaultValues?: OrderFormInputsType;
        paymentMethodLabel?: string;
        errorReqMsg?: string;
        errorInvalidEmailMsg?: string;
        errorInvalidPhoneMsg?: string;
    };
}
```

Usage example OrderPlace react component:

<!-- prettier-ignore -->
```tsx

enum OrderModuleFiledNameEnum {
    name = 'name',
    email = 'email',
    phoneNumber = 'phoneNumber',
    address = 'address',
    country = 'country',
    city = 'city',
    zip = 'zip',
    careOf = 'careOf',
    organizationNumber = 'organizationNumber',
    buyerReference = 'buyerReference',
    orderReference = 'orderReference',
    invoiceName = 'invoiceName',
    invoiceAddress = 'invoiceAddress',
    invoiceCity = 'invoiceCity',
    invoiceZip = 'invoiceZip',
    invoiceCountry = 'invoiceCountry',
    invoicePhone = 'invoicePhoneNumber',
    invoiceEmail = 'invoiceEmail',
    invoiceCareOf = 'invoiceCareOf',
    invoiceBuyerReference ='invoiceBuyerReference',
}

export const prepareConfig = ({
    submitStartCallback,
    apiKey,
    apiUrl,
    userId,
    subscriberId,
    templatePackageId,
    identityProviderId,
    organizationId,
    selfServiceUrl,
    userEmail,
    name,
    city,
    country,
    postalCode,
    streetAddress,
}: Props) => {

    const config = {
        submitStartCallback,
        userActionCallback: (action, args) => {
          console.log(action);
          console.table(args);
        },
        moduleTitle: '',
        domElementId: ORDER_PLACE_ID,
        redirectUrl: window.location.href,
        merchantAgreementUrl: selfServiceUrl,
        showIframe: true,
        apiKey,
        apiUrl,
        userId,
        subscriberId,
        templatePackageId,
        identityProviderId,
        organizationId,
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
                        name: OrderModuleFiledNameEnum.name,
                        label: 'Name',
                        required: false,
                    },
                    {
                        name: OrderModuleFiledNameEnum.phoneNumber,
                        label: 'Phone',
                        readOnly: false,
                        required: false,
                    },
                    {
                        name: OrderModuleFiledNameEnum.email,
                        label: 'Email',
                        required: true,
                        readOnly: !!userEmail,
                    },
                ],
            },
            Invoice: {
                orderFormFields: [
                    {
                        name: OrderModuleFiledNameEnum.address,
                        label: 'Address',
                        required: false,
                        readOnly: false,
                    },
                ],
            },
            Email: {
                orderFormFields: [
                    {
                        name: OrderModuleFiledNameEnum.address,
                        label: 'Address',
                        required: false,
                        readOnly: false,
                    },
                ],
                paymentInvoiceFields: [
                    {
                        name: OrderModuleFiledNameEnum.invoiceEmail,
                        label: 'Email',
                        required: true,
                        readOnly: false,
                    },
            ],
            },
            EHF: {
                orderFormFields: [
                    {
                        name: OrderModuleFiledNameEnum.address,
                        label: 'Address',
                        required: false,
                        readOnly: false,
                    },
                ],
            },
            OIO: {
                orderFormFields: [
                    {
                        name: OrderModuleFiledNameEnum.address,
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
            fields: [
                {
                    name: OrderModuleFiledNameEnum.invoiceAddress,
                    label: 'Address',
                    required: false,
                    readOnly: false,
                },
            ],
        },
        settings: {
            submitButtonText: 'Continue',
            backButtonText: 'Back',
            verifyButtonText: 'Verify',
            organizationNumberLabel: 'Organization Number',
            glnLabel: 'GLN/EAN',
            cvrLabel: 'CVR',
            paymentMethodLabel: 'Select Payment Method',
            errorReqMsg: 'This field is required!',
            errorInvalidEmailMsg: 'Invalid email address!',
            errorInvalidPhoneMsg: 'Invalid phone number!',
            paymentMethodNotAllowedMsg: 'This payment method not allowed!',
            invoiceLookupNotFoundText: 'There was no recipient found for the given information',
            successText: 'Success message',
            failureText: 'Failed message',
            orderDefaultValues: {
                name,
                email: userEmail || '',
                phoneNumber: '',
                city,
                country,
                zip: postalCode,
                address: streetAddress,
                paymentMethod: undefined,
            },
        },
    };

    return config as ConfigType;
};


import { FC, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderComponent } from '@infosoftas/s4-orders-js-sdk/src/index';

import { prepareConfig } from 'Utils/moduleConfig';
import { encodeJwt } from 'Utils/helper';

const ORDER_PLACE_ID = 'sdk-order';

const OrderPlace: FC = ({journey, userEmail, sub, emails, userId, name, city, country, postalCode, streetAddress}) => {
    const moduleMount = useRef(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const submitStartCallback = useCallback(
        (subscriberId: string) => {
            const hashTokenValue = {
                extension_SubscriberId: subscriberId,
                emails: emails,
                sub: sub,
            };

            searchParams?.set('hashToken', encodeJwt(hashTokenValue) as string);
            setSearchParams(searchParams);
        },
        [emails, sub, searchParams, setSearchParams]
    );

    useEffect(() => {
        if (!moduleMount.current && idTokenClaims) {
            moduleMount.current = true;
            const config = prepareConfig({
                apiKey: API_KEY,
                apiUrl: API_URL,
                userId: userId || '',
                subscriberId: userEmail || '',
                identityProviderId: IDENTITY_PROVIDER_ID,
                templatePackageId: TEMPLATE_PACKAGE_ID,
                selfServiceUrl: SELF_SERVICE_URL,
                organizationId: ORGANIZATION_ID,
                userEmail: userEmail || '',
                name: name,
                city: city,
                country: country,
                postalCode: postalCode,
                streetAddress: streetAddress,
                journey: journey,
                submitStartCallback: submitStartCallback,
            });
            orderComponent?.remove();
            orderComponent?.init(config);
        }
    }, [userEmail, userId, name, city, country, postalCode, streetAddress, journey, submitStartCallback]);

    return (
        <div
            id={ORDER_PLACE_ID}
            className="w-100 order-wrapper"
            data-testid="order-place-id"
        />
    );
};

export default OrderPlace;
```

<!-- prettier-ignore -->
| Option                |                                    Default                                     |                Description |
| --------------------- | :----------------------------------------------------------------------------: | -------------------------: |
| moduleTitle           |                                       ''                                       |               module title |
| apiKey                |                                       ''                                       |              order api key |
| apiUrl                |                                       ''                                       |              order api url |
| templatePackageId     |                                       ''                                       |        template package id |
| subscriberId          |                                       ''                                       |              subscriber id |
| identityProviderId    |                                       ''                                       |       identity provider id |
| organizationId        |                                       ''                                       |            organization id |
| redirectUrl           |                              window.location.href                              |               redirect url |
| showIframe            |                                     false                                      | show credit card in iframe |
| userActionCallback    |                                   undefined                                    | function for tracking user actions |
| paymentMethodsOptions | orderFormFields: [{name: 'phone, required: false, readOnly: false, label: ''}] |        default form fields |
| availablePaymentMethods | [] | available payment methods |
| language | 'en-US' | language |
| merchantAgreementUrl | '' | vipps and MobilePay property |
| settings | {successText: 'Order successful completed!',failureText: 'Something went wrong!',submitButtonText: 'Start',backButtonText: 'Back',verifyButtonText: 'Verify',organizationNumberLabel: 'CVR',glnLabel: 'GLN',paymentMethodLabel:'Select Payment Method', orderDefaultValues: 'Default order form values', paymentMethodNotAllowedMsg: 'This payment method not allowed!', invoiceLookupNotFoundText: 'There was no recipient found for the given information' } | label and text properties |
