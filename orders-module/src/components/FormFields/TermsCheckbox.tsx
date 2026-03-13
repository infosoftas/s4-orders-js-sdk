import { FC, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

import { uuidv4 } from '../../utils/helper';

type Props = {
    name?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string | ReactNode;
    errorReqMsg?: string;
    errors?: {
        [key: string]: {
            message?: string;
        };
    };
};

const TermsCheckbox: FC<Props> = ({
    name = 'terms',
    required = true,
    disabled = false,
    label = 'I accept the terms and conditions',
    errorReqMsg = 'You must accept the terms and conditions to proceed.',
    errors,
}) => {
    const { register } = useFormContext();
    const id = uuidv4();

    return (
        <div className="checkbox-wrapper" data-testid={`sdk-${name}-field-id`}>
            <>
                <input
                    id={id}
                    type="checkbox"
                    disabled={disabled}
                    className={`checkbox-control ${disabled ? 'disabled' : ''}`}
                    {...register(name, {
                        required: required ? errorReqMsg : false,
                    })}
                />
                <label
                    className="checkbox-label"
                    htmlFor={id}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                >
                    {label} {required && <span className="text-error">*</span>}
                </label>
            </>

            {errors && errors[name] && (
                <div className="text-error caption">{errors[name].message}</div>
            )}
        </div>
    );
};

export default TermsCheckbox;
