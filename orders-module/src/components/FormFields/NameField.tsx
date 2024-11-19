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
        name?: {
            message?: string;
        };
    };
};

const NameField: FC<Props> = ({
    required = false,
    readOnly = false,
    label = 'Name',
    errorReqMsg = 'This field is required!',
    errors,
}) => {
    const { register } = useFormContext();
    const id = uuidv4();
    return (
        <div className="field-wrapper" data-testid="sdk-name-field-id">
            <input
                id={id}
                autoComplete="name"
                placeholder=" "
                readOnly={readOnly}
                className={`input-control ${readOnly ? 'read-only' : ''}`}
                {...register('name', {
                    required: required ? errorReqMsg : false,
                })}
            />
            <label className="label-control" htmlFor={id}>
                {label} {required && <span className="text-error">*</span>}
            </label>
            {errors && errors.name && (
                <div className="text-error caption">{errors.name.message}</div>
            )}
        </div>
    );
};

export default NameField;
