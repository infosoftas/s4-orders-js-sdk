import fetcher from '../utils/fetcher';

type RequestInvoiceLookupType = {
    network: string;
    value: string;
};

type InvoiceLookupResponseType = {
    receivesInvoice: boolean;
    recievesInvoice: boolean; // TODO: Should be deleted in the future (misspelled), use "receivesInvoice" instead of this.
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
