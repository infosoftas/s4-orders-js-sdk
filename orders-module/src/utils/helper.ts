import { WRONG_MSG } from 'Constants/index';

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
