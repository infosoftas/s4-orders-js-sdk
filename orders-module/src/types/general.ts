export type ConfigType = {
    domElementId: string;
    companyName: string;
    templatePackageId: string;
    subscriberId: string;
    tenantId: string;
    organizationId: string;
    redirectUrl: string;
    showIframe?: boolean;
    strings?: {
        somethingWrongText?: string;
        buttonText?: string;
    };
};

export type CompleteOrderParamsType = {
    orderId: string;
    agreementId: string;
};
