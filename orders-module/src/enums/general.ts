export enum PaymentMethodEnum {
    Vipps = 'Vipps',
    MobilePay = 'MobilePay',
    SwedbankPay = 'SwedbankPay',
}

export enum MessageEventTypeEnum {
    ORDER_FLOW_COMPLETE = 'orderFlowComplete',
    VIPPS_COMPLETE = 'completeOrder',
    CANCEL = 'cancel',
    COMPLETE = 'complete',
}
