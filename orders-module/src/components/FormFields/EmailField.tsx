import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
    name: string;
    required: boolean;
    readOnly: boolean;
    label?: string;
    errorReqMsg?: string;
    errorInvalidEmailMsg?: string;
    errors?: {
        email?: {
            message?: string;
        };
    };
};

const EmailField: FC<Props> = ({
    required = false,
    readOnly = false,
    label = 'Email',
    errorReqMsg = 'This field is required!',
    errorInvalidEmailMsg = 'Invalid email address!',
    errors,
}) => {
    const { register } = useFormContext();
    return (
        <div className="field-wrapper" data-testid="sdk-email-field-id">
            <input
                autoComplete="email"
                placeholder=" "
                className={`input-control ${readOnly ? 'read-only' : ''}`}
                readOnly={readOnly}
                type="email"
                {...register('email', {
                    required: required ? errorReqMsg : false,
                    pattern: {
                        value: /^[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]+)*@[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]{2,20})+$/i,
                        message: errorInvalidEmailMsg,
                    },
                })}
            />
            <label className="label-control">
                {label} {required && <span className="text-error">*</span>}
            </label>
            {errors && errors.email && (
                <div className="text-error caption">{errors.email.message}</div>
            )}
        </div>
    );
};

export default EmailField;
