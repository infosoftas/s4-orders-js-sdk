import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { uuidv4 } from '../../utils/helper';

type Props = {
    name: string;
    required?: boolean;
    readOnly?: boolean;
    label?: string;
    errorReqMsg?: string;
    errors?: {
        [key: string]: {
            message?: string;
        };
    };
    toggleCallback?: (value: boolean) => void;
};

const ToggleField: FC<Props> = ({
    name,
    required = false,
    readOnly = false,
    label = '',
    errorReqMsg = 'This field is required!',
    errors,
    toggleCallback
}) => {
    const { register } = useFormContext();
    const id = uuidv4();
    return (
        <div className="field-wrapper">
            <div className="d-flex align-center flex-wrap">
                <label className="sdk-on-off-label" htmlFor={id}>
                    {label} {required && <span className="text-error">*</span>}
                </label>
                <label
                    className="sdk-on-off"
                    data-testid={`sdk-${name}-field-id`}
                >
                    <input
                        id={id}
                        type="checkbox"
                        readOnly={readOnly}
                        className={`${readOnly ? 'read-only' : ''}`}
                        {...register(name, {
                            required: required ? errorReqMsg : false,
                        })}
                        onClick={(e) => toggleCallback?.(e.currentTarget.checked)}
                    />
                    <span className="slider round"></span>
                </label>
            </div>
            {errors && errors[name] && (
                <div className="text-error caption">{errors[name].message}</div>
            )}
        </div>
    );
};

export default ToggleField;
