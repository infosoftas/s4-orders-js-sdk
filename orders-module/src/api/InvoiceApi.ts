import fetcher from '../utils/fetcher';

type RequestInvoiceLookupType = {
    network: string;
    value: string;
};

type InvoiceLookupResponseType = {
    recievesInvoice: boolean;
};

export const invoiceLookup = (
    body: RequestInvoiceLookupType
): Promise<InvoiceLookupResponseType> =>
    fetcher<InvoiceLookupResponseType, RequestInvoiceLookupType>({
        method: 'POST',
        url: '/invoicelookup',
        headers: {
            'S4-ORDERS-API-KEY':
                sessionStorage.getItem('sdk_api_key') || '',
        },
        body,
    }) as Promise<InvoiceLookupResponseType>;
