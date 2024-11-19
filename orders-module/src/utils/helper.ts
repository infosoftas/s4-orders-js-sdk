import { WRONG_MSG } from '../constants/index';
import { ErrorsMsg } from '../types/general';

export const prepareErrorMessage = (error: Error, defaultMsg?: string) => {
    if (typeof error === 'string') {
        try {
            const parsedError = JSON.parse(error);
            return (parsedError as { message: string }).message;
        } catch (e) {
            return error;
        }
    } else {
        return (
            ((error as { message: string })?.message as string) ||
            defaultMsg ||
            WRONG_MSG
        );
    }
};

export const prepareErrorsArrayMessage = (errors: ErrorsMsg | null) => {
    const msg: string[] = [];

    if (errors) {
        Object.entries(errors).forEach(([_, values]) => {
            if (values?.length > 0) {
                values.forEach((i) => {
                    msg.push(i);
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
