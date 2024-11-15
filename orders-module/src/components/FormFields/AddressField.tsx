import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { uuidv4 } from 'Utils/helper';

type Props = {
    name: string;
    required: boolean;
    readOnly: boolean;
    label?: string;
    errorReqMsg?: string;
    errors?: {
        address?: {
            message?: string;
        };
    };
};

const AddressField: FC<Props> = ({
    required = false,
    readOnly = false,
    label = 'Address',
    errorReqMsg = 'This field is required!',
    errors,
}) => {
    const { register } = useFormContext();
    const id = uuidv4();
    return (
        <div className="field-wrapper" data-testid="sdk-address-field-id">
            <textarea
                id={id}
                autoComplete="address"
                placeholder=" "
                readOnly={readOnly}
                className={`input-control ${readOnly ? 'read-only' : ''}`}
                {...register('address', {
                    required: required ? errorReqMsg : false,
                })}
            />
            <label className="label-control" htmlFor={id}>
                {label} {required && <span className="text-error">*</span>}
            </label>
            {errors && errors.address && (
                <div className="text-error caption">
                    {errors.address.message}
                </div>
            )}
        </div>
    );
};

export default AddressField;
