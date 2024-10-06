export enum PaymentMethodEnum {
    Vipps = 'Vipps',
    MobilePay = 'MobilePay',
    SwedbankPay = 'SwedbankPay',
}

export enum MessageEventTypeEnum {
    VIPPS_COMPLETE = 'completeOrder',
    CANCEL = 'cancel',
    COMPLETE = 'complete',
}
