import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { uuidv4 } from '../../utils/helper';

type Props = {
    name: string;
    required: boolean;
    readOnly: boolean;
    label?: string;
    errorReqMsg?: string;
    errorInvalidPhoneMsg?: string;
    errors?: {
        [key: string]: {
            message?: string;
        };
    };
};

const PhoneFiled: FC<Props> = ({
    name = 'phoneNumber',
    required = false,
    readOnly = false,
    label = 'Phone number',
    errorReqMsg = 'This field is required!',
    errorInvalidPhoneMsg = 'Invalid phone address!',
    errors,
}) => {
    const { register } = useFormContext();
    const id = uuidv4();
    return (
        <div className="field-wrapper" data-testid="sdk-phone-field-id">
            <input
                id={id}
                autoComplete="tel"
                className={`input-control ${readOnly ? 'read-only' : ''}`}
                placeholder=" "
                readOnly={readOnly}
                type="tel"
                {...register(name, {
                    required: required ? errorReqMsg : false,
                    pattern: {
                        value: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]{6,14}$/g,
                        message: errorInvalidPhoneMsg,
                    },
                })}
            />
            <label className="label-control" htmlFor={id}>
                {label} {required && <span className="text-error">*</span>}
            </label>
            {errors && errors[name] && (
                <div className="text-error caption">{errors[name].message}</div>
            )}
        </div>
    );
};

export default PhoneFiled;
