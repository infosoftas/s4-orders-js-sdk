import { z, ZodTypeAny } from 'zod';

import EmailField from './EmailField';
import PhoneField from './PhoneField';
import NameField from './NameField';
import AddressField from './AddressField';
import TermsCheckbox from './TermsCheckbox';
import formFieldsMapper from './FormFieldsMapper';

export const EMAIL_PATTERN =
    /^[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]+)*@[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]{2,20})+$/i;
export const PHONE_PATTERN = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]{6,14}$/;
const NON_BLANK_PATTERN = /\S/;

export type FieldValidationMessages = {
    errorReqMsg?: string;
    errorInvalidEmailMsg?: string;
    errorInvalidPhoneMsg?: string;
};

const matchesWhenFilled = (pattern: RegExp) => (value: string) =>
    value === '' || pattern.test(value);

export const buildFieldSchema = (
    fieldName: string,
    required: boolean,
    messages: FieldValidationMessages = {}
): ZodTypeAny => {
    const reqMsg = messages.errorReqMsg || 'This field is required!';
    const Component = formFieldsMapper[fieldName];

    if (Component === EmailField) {
        const emailMsg =
            messages.errorInvalidEmailMsg || 'Invalid email address!';
        const base = required ? z.string().min(1, reqMsg) : z.string();
        return base.refine(matchesWhenFilled(EMAIL_PATTERN), emailMsg);
    }

    if (Component === PhoneField) {
        const phoneMsg =
            messages.errorInvalidPhoneMsg || 'Invalid phone number!';
        const base = required ? z.string().min(1, reqMsg) : z.string();
        return base.refine(matchesWhenFilled(PHONE_PATTERN), phoneMsg);
    }

    if (Component === AddressField) {
        const trimmed = z
            .string()
            .transform((value) => (typeof value === 'string' ? value.trim() : value));
        return required
            ? trimmed.refine((value) => value.length > 0, { message: reqMsg })
            : trimmed;
    }

    if (Component === NameField) {
        return required
            ? z.string().min(1, reqMsg).regex(NON_BLANK_PATTERN, reqMsg)
            : z.string();
    }

    if (Component === TermsCheckbox) {
        const schema = z.boolean();
        return required
            ? schema.refine((value) => value === true, { message: reqMsg })
            : schema;
    }

    return required
        ? z.string().min(1, reqMsg).regex(NON_BLANK_PATTERN, reqMsg)
        : z.string();
};
