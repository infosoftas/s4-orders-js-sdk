import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
    name: string;
    required: boolean;
    readOnly: boolean;
    errors?: {
        name?: {
            message?: string;
        };
    };
};

const NameField: FC<Props> = ({
    required = false,
    readOnly = false,
    errors,
}) => {
    const { register } = useFormContext();
    return (
        <div className="field-wrapper" data-testid="sdk-name-field-id">
            <input
                autoComplete="name"
                placeholder=" "
                readOnly={readOnly}
                className={`input-control ${readOnly ? 'read-only' : ''}`}
                {...register('name', {
                    required: required ? 'This field is required!' : false,
                })}
            />
            <label className="label-control">
                Name {required && <span className="text-error">*</span>}
            </label>
            {errors && errors.name && (
                <div className="text-error caption">{errors.name.message}</div>
            )}
        </div>
    );
};

export default NameField;
