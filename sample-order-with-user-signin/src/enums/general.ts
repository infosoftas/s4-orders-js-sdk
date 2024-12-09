export enum AuthOpenTypeEnum {
    POPUP = 'popup',
    REDIRECT = 'redirect',
}

export enum PaymentMethodEnum {
    Vipps = 'Vipps',
    MobilePay = 'MobilePay',
    SwedbankPay = 'SwedbankPay',
    Invoice = 'Invoice',
    Email = 'Email',
    EHF = 'EHF',
    OIO = 'OIO',
}

export enum OrderModuleFiledNameEnum {
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
    invoiceBuyerReference = 'invoiceBuyerReference',
}

export enum LanguageCodeEnum {
    NB = 'nb',
    EN = 'en',
    SV = 'sv',
    SE = 'se',
    DA = 'da',
}

export enum AllowLanguageCodeEnum {
    EN = 'en-US', // english
    SV = 'sv-SE', // swedish
    NB = 'nb-NO', // norwegian
    DA = 'da-DK', // danish
    FI = 'fi-FI', // finish
}

export enum OrderActionEnum {
    OrderFlowComplete = 'orderFlowComplete',
    OrderFlowCancel = 'orderFlowCancel',
    OrderUpdateInfo = 'orderUpdateInfo',
    VippsComplete = 'completeOrder',
    Complete = 'complete',
    Cancel = 'cancel',
}

export enum JourneyEnum {
    USER = 'user',
    ORDER = 'order',
    ORDER_ADDRESS = 'order-address',
    ORDER_BUSINESS = 'order-business',
    USER_DOMAIN = 'user-domain',
}
