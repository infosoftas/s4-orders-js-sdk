import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
    name: string;
    required: boolean;
    errors?: {
        name?: {
            message?: string;
        };
    };
};

const NameField: FC<Props> = ({ required = false, errors }) => {
    const { register } = useFormContext();
    return (
        <div className="field-wrapper" data-testid="sdk-name-field-id">
            <label>Name</label>
            <input
                autoComplete="name"
                className="input-control"
                {...register('name', {
                    required: required ? 'This field is required!' : false,
                })}
            />
            {errors && errors.name && (
                <div className="text-error caption">{errors.name.message}</div>
            )}
        </div>
    );
};

export default NameField;
