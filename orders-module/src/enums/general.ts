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
