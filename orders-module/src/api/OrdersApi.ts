import { ApiResponseType } from 'Types/api';
import fetcher from 'Utils/fetcher';

type OrderResponseType = {
    id: number;
    terminalRedirectUrl: string;
};

export const createOrder = (): Promise<ApiResponseType<OrderResponseType>> =>
    fetcher<OrderResponseType>({
        method: 'GET',
        url: '/6b5cbdda27effa77d171',
    });
