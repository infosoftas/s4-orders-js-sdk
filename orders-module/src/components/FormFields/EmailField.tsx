import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
    name: string;
    required: boolean;
    errors?: {
        email?: {
            message?: string;
        };
    };
};

const EmailField: FC<Props> = ({ required = false, errors }) => {
    const { register } = useFormContext();
    return (
        <div className="field-wrapper" data-testid="sdk-email-field-id">
            <input
                autoComplete="email"
                placeholder=" "
                className="input-control"
                type="email"
                {...register('email', {
                    required: required ? 'This field is required!' : false,
                    pattern: {
                        value: /^[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]+)*@[-!#-'*+/-9=?^-~]+(?:\.[-!#-'*+/-9=?^-~]{2,20})+$/i,
                        message: 'Invalid email address!',
                    },
                })}
            />
            <label className="label-control">
                Email {required && <span className="text-error">*</span>}
            </label>
            {errors && errors.email && (
                <div className="text-error caption">{errors.email.message}</div>
            )}
        </div>
    );
};

export default EmailField;
