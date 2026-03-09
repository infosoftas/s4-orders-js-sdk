export enum PaymentMethodEnum {
    Vipps = 'Vipps',
    MobilePay = 'MobilePay',
    SwedbankPay = 'SwedbankPay',
    Invoice = 'Invoice',
    Email = 'Email',
    EHF = 'EHF',
    OIO = 'OIO',
}

export enum MessageEventTypeEnum {
    ORDER_FLOW_COMPLETE = 'orderFlowComplete',
    ORDER_FLOW_CANCEL = 'orderFlowCancel',
    ORDER_UPDATE_INFO = 'orderUpdateInfo',
    VIPPS_COMPLETE = 'completeOrder',
    CANCEL = 'cancel',
    COMPLETE = 'complete',
}

export enum InvoiceLookupNetworkEnum {
    EHF = '0192',
    OIO_GLN = '0088',
    OIO_Danish_CVR = '0096',
}

export enum FormTypeEnum {
    ORDER = 'order',
    EHF = 'EHF',
    OIO = 'OIO',
}

export enum UserActionEnum {
    SELECT_FORM = 'selectForm',
    SELECT_PAYMENT_METHOD = 'selectPaymentMethod',
    RETURN_TO_MAIN = 'returnToMain',
    TOGGLE_INVOICE_ADDRESS = 'toggleInvoiceAddress',
    SEARCH_ORGANIZATION_NUMBER = 'searchOrganizationNumber',
}
