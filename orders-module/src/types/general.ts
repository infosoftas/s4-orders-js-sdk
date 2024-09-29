export type ConfigType = {
    domElementId: string;
    companyName: string;
    templatePackageId: string;
    subscriberId: string;
    tenantId: string;
    organizationId: string;
    redirectUrl?: string;
    paymentMethod?: string;
    generateSubscriberContact?: string;
    showIframe?: boolean;
    availablepaymentmethods?: string[];
    strings?: {
        successText?: string;
        failureText?: string;
        buttonText?: string;
    };
};
