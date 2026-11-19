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

### `npm test`

Runs completion-flow regression tests.

## Order completion

The Simple Orders API completion POST acknowledges receipt; it does not wait
for order processing. By default, the SDK then reads `GET /order/{id}` using
the configured `apiUrl` and API key. Deploy that endpoint before upgrading.

The SDK reads immediately, then waits 500 ms between completed reads, with at
most one request in flight. Polling stops after 10 seconds, including time
spent waiting for a response. Only status `Completed` displays `successText`,
invokes `orderCompletedCallback`, and emits the existing `orderFlowComplete`
message. That message retains `isCompleted` and `orderInfo`, and adds the
exact submitted `orderId`. `orderInfo` can be `null` after a payment redirect.
Completed order processing does not guarantee downstream subscription or
entitlement visibility.

While polling, the SDK shows `settings.orderProcessingText`. If the deadline
expires, it shows `settings.orderDelayedText`, defaulting to:

> Your order was received, but things are taking longer than expected.

It invokes `orderCompletionDelayedCallback` with reason `timeout`. This is
not an order failure: the SDK does not emit success, redirect, reopen the
order form, or resubmit the order. The host can use the callback to provide
its own follow-up experience.

Polling continues only while the order status is `Created` or `InProgress`.
Network errors, temporary 404s and server errors are retried within the
deadline. Rate limiting honors `Retry-After`; if that header is missing,
invalid or not exposed by CORS, no further reads occur before the deadline.
Other HTTP errors (including `401`, which means the token has expired and the
user must sign in again), malformed responses and any other status stop
verification and show the same received message with callback reason
`statusUnavailable`; they do not prove rejection.
`Cancelled` and `Rejected` instead show `failureText` and invoke
`orderCompletionFailedCallback` with the returned status, without reopening
submission. Removing the SDK or switching orders aborts outstanding reads.
An accepted completion POST is not repeated for the same order.

### Payment returns

All online payment methods (Vipps, MobilePay, SwedbankPay and Mollie) use
full-page redirects to the provider. The provider returns to `redirectUrl`
(default: the current page), and the SDK reads the return from the URL
parameters (`action=complete`/`action=cancel` with `S4OrderId`, or Vipps'
`orderId` and `agreementId`). The SDK never completes or cancels an order
because of a browser `message` event. It only posts its own notifications
(`orderFlowComplete`, `orderFlowCancel`, `orderUpdateInfo`) to the host page.

### Callbacks and external confirmation

All completion callbacks receive `{ orderId, orderInfo }`, where `orderId`
is always the ID submitted in the successful POST and `orderInfo` is nullable.
`orderAcceptedCallback` runs after that POST succeeds, before polling.
Delayed callbacks additionally receive `reason`; failed callbacks receive
`status`. Callback errors do not change the order outcome.

Set `completionMode: 'external'` to opt out of SDK polling:

```ts
orderComponent.init({
    // ...existing configuration
    completionMode: 'external',
    orderAcceptedCallback: ({ orderId, orderInfo }) => {
        // The host now owns verification, success UI and any redirect.
    },
});
```

External mode shows `settings.orderReceivedText` (default: "Your order was
received.") and does not display success or emit `orderFlowComplete`.
Use an acceptance callback to hand off confirmation to the host. There is
no automatic success fallback when polling is disabled.

**Migration:** `orderFlowComplete` now means confirmed order completion, not
POST acceptance. Consumers must not treat payment-provider returns as success.
Trigger success UI, conversion tracking and
redirects only from confirmed completion. No consumer-side poller is needed
when using the default mode.

## Usage

The package needs to be configured with configuration object:

<!-- prettier-ignore -->
```ts

enum PaymentMethodEnum {
    Vipps = 'Vipps',
    MobilePay = 'MobilePay',
    SwedbankPay = 'SwedbankPay',
    Mollie = 'Mollie',
    Invoice = 'Invoice',
    Email = 'Email',
    EHF = 'EHF',
    OIO = 'OIO',
}

type OrderFormFieldType = {
    name: string;
    required?: boolean;
    readOnly?: boolean;
    label?: string;
};

type PaymentMethodSettingsType = {
    [key in PaymentMethodEnum]?: {
        generateSubscriberContact?: boolean;
        accountId?: string;
        orderFormFields?: OrderFormFieldType[];
        paymentInvoiceFields?: OrderFormFieldType[] | never[] | null;
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

type OrderCompletionEventType = {
    orderId: string;
    orderInfo: {
        orderId: string;
        subscriberId: string;
        paymentMethod: string;
    } | null;
};

type ConfigType = {
    completionMode?: 'sdk' | 'external'; // Default: 'sdk'
    orderAcceptedCallback?: (event: OrderCompletionEventType) => void;
    orderCompletedCallback?: (event: OrderCompletionEventType) => void;
    orderCompletionDelayedCallback?: (
        event: OrderCompletionEventType & { reason: 'timeout' | 'statusUnavailable' }
    ) => void;
    orderCompletionFailedCallback?: (
        event: OrderCompletionEventType & { status: 'Cancelled' | 'Rejected' }
    ) => void;
    domElementId: string;
    moduleTitle?: string;
    submitStartCallback?: (subscriberId: string) => void;
    userActionCallback?: (action: UserActionEnum, args: object | null | undefined) => void;
    setContactCallback?: (contactInfo: ContactRequestType) => void;
    cancelVippsCallback?: () => void;
    apiKey?: string;
    apiUrl?: string;
    templatePackageId: string;
    subscriberId: string;
    userId: string;
    identityProviderId: string;
    organizationId: string;
    redirectUrl?: string;
    /**
     * The full list of payment methods displayed in the UI, each with a display label and value.
     * Controls what the user sees in the payment method selector.
     * @example [{ label: 'Credit Card', value: 'SwedbankPay' }, { label: 'Invoice', value: 'Invoice' }]
     */
    availablePaymentMethods?: {
        label: string;
        value: PaymentMethodEnum;
        description?: string;
        icons?: { src: string; alt?: string; className?: string }[];
    }[];
    /**
     * Whitelist of payment methods the subscriber is permitted to use.
     * If a method is in availablePaymentMethods but not here, it will be shown but blocked.
     * @example ['SwedbankPay', 'Invoice']
     */
    allowedPaymentMethods?: PaymentMethodEnum[];
    /**
     * Per-payment-method form field configuration.
     * Controls which input fields are shown in the order form for each payment method.
     * Use accountId on SwedbankPay to set your Swedbank Pay account ID.
     */
    paymentMethodsOptions?: PaymentMethodSettingsType;
    requireTermsAcceptance?: boolean;
    language?: string;
    merchantAgreementUrl?: string;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFieldType[];
    };
    settings?: {
        successText?: string;
        orderProcessingText?: string;
        orderReceivedText?: string;
        orderDelayedText?: string;
        failureText?: string;
        submitButtonText?: string;
        backButtonText?: string;
        verifyButtonText?: string;
        organizationNumberLabel?: string;
        cvrLabel?: string;
        glnLabel?: string;
        orderDefaultValues?: OrderFormInputsType;
        paymentMethodLabel?: string;
        contactDetailsLabel?: string;
        /**
         * Ids of existing elements on the host page. When set, the matching
         * order form section is rendered into that element instead of inline.
         */
        paymentMethodElementId?: string;
        contactDetailsElementId?: string;
        errorReqMsg?: string;
        errorInvalidEmailMsg?: string;
        errorInvalidPhoneMsg?: string;
        errorTermsMsg?: string;
        errorValidationTitleMsg?: string;
        errorValidationDenialOrderBlockingMsg?: string;
        errorValidationBlockingOffersMsg?: string;
        paymentMethodNotAllowedMsg?: string;
        invoiceLookupNotFoundText?: string;
        orderDenialOfferBaseText?: string;
        orderDenialOfferWithFallbackText?: string;
        orderDenialAmountText?: string;
        fetchDenialFallbackOffer?: (organizationId: string) => Promise<OrderDenialFallbackOfferType | undefined>;
        termsAndConditionsText?: string | ReactNode;
        /**
         * When set, submitting the order opens a confirmation dialog first.
         * The order is only sent once the user confirms.
         */
        submitConfirmation?: {
            title: string;
            description?: string;
            confirmText: string;
            cancelText: string;
        };
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
                { label: "Mollie", value: "Mollie" },
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
            Mollie: {
                accountId: 'your-mollie-account-id',
                orderFormFields: [
                    {
                        name: OrderModuleFiledNameEnum.name,
                        label: 'Name',
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
            errorValidationTitleMsg: 'One or more validation errors occurred.',
            errorValidationDenialOrderBlockingMsg: 'The order/subscription will not be created because the subscriber has a denial order blocking all.',
            errorValidationBlockingOffersMsg: 'The order/subscription will not be created because the subscriber has a denial order blocking offers.',
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
| userActionCallback    |                                   undefined                                    | function for tracking user actions |
| cancelVippsCallback   |                                   undefined                                    | callback invoked when a Vipps/MobilePay payment is cancelled |
| paymentMethodsOptions | orderFormFields: [{name: 'phoneNumber', required: false, readOnly: false, label: ''}] |        default form fields |
| availablePaymentMethods | [] | available payment methods to display |
| allowedPaymentMethods | [] | list of payment methods the subscriber is allowed to use |
| requireTermsAcceptance | false | when true, the user must accept terms and conditions before submitting |
| language | 'en-US' | language |
| merchantAgreementUrl | '' | vipps and MobilePay property |
| settings.paymentMethodElementId / settings.contactDetailsElementId | undefined | ids of host page elements to render the payment method / contact detail sections into, instead of inline |
| settings.submitConfirmation | undefined | `{ title, description?, confirmText, cancelText }` — shows a confirmation dialog before the order is submitted |
| settings.contactDetailsLabel | undefined | heading for the contact details section |
| settings.errorTermsMsg | undefined | validation message shown when terms are not accepted |
| settings | {successText: 'Order completed successfully!', failureText: 'Something went wrong!', submitButtonText: 'Start', backButtonText: 'Back', verifyButtonText: 'Verify', organizationNumberLabel: 'Organization Number', cvrLabel: 'CVR', glnLabel: 'GLN', paymentMethodLabel: 'Select Payment Method', orderDefaultValues: 'Default order form values', errorReqMsg: '', errorInvalidEmailMsg: '', errorInvalidPhoneMsg: '', errorValidationTitleMsg: 'One or more validation errors occurred.', errorValidationDenialOrderBlockingMsg: '...', errorValidationBlockingOffersMsg: '...', paymentMethodNotAllowedMsg: 'This payment method not allowed!', invoiceLookupNotFoundText: 'There was no recipient found for the given information', termsAndConditionsText: '' } | label and text properties |
