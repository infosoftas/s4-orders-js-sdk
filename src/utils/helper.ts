import { WRONG_MSG } from '../constants/index';
import { ErrorsMsg } from '../types/general';

export const prepareErrorMessage = (error: Error, defaultMsg?: string, translations?: ErrorMessages) => {
    if (typeof error === 'string') {
        try {
            const parsedError = JSON.parse(error);
            return (parsedError as { message: string }).message;
        } catch (e) {
            return translateError(error, translations);
        }
    } else {
        const serverErrorMsg = (error as { message: string })?.message as string;
        return translateError(serverErrorMsg, translations) || defaultMsg || WRONG_MSG;
    }
};

export const prepareErrorsArrayMessage = (errors: ErrorsMsg | null, translations?: ErrorMessages) => {
    const msg: string[] = [];

    if (errors) {
        Object.entries(errors).forEach(([_, values]) => {
            if (values?.length > 0) {
                values.forEach((i) => {
                    msg.push(translateError(i, translations));
                });
            }
        });
    }

    return msg;
};

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}

export type ErrorMessages = {
    errorValidationTitleMsg: string,
    errorValidationBlockingOffersMsg: string,
    errorValidationDenialOrderBlockingMsg: string,
};

const translateError = (errorMsg: string, translations?: ErrorMessages) => {
    if (!translations) {
        return errorMsg;
    }

    switch(errorMsg)
    {
        case 'One or more validation errors occurred.':
            return translations?.errorValidationTitleMsg;
        case 'The order/subscription will not be created because the subscriber has a denial order blocking offers.':
            return translations?.errorValidationBlockingOffersMsg;
        case 'The order/subscription will not be created because the subscriber has a denial order blocking all.':
            return translations?.errorValidationDenialOrderBlockingMsg;
        default:
           return errorMsg; 
    }
}