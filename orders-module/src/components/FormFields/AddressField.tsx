import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { uuidv4 } from '../../utils/helper';

type Props = {
    name: string;
    required: boolean;
    readOnly: boolean;
    label?: string;
    errorReqMsg?: string;
    errors?: {
        [key: string]: {
            message?: string;
        };
    };
};

const AddressField: FC<Props> = ({
    name = 'address',
    required = false,
    readOnly = false,
    label = 'Address',
    errorReqMsg = 'This field is required!',
    errors,
}) => {
    const { register, setValue, watch } = useFormContext();

    const value = watch(name);

    const id = uuidv4();
    return (
        <div className="field-wrapper" data-testid={`sdk-${name}-field-id`}>
            <textarea
                id={id}
                autoComplete="address"
                placeholder=" "
                readOnly={readOnly}
                className={`input-control ${readOnly ? 'read-only' : ''}`}
                {...register(name, {
                    required: required ? errorReqMsg : false,
                })}
                {...(required ? {
                    value: value || '',
                    onBlur: () => {
                        const newValue = value?.trim() || '';
                        setValue(name, newValue);
                    },
                } : '')}
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

export default AddressField;
