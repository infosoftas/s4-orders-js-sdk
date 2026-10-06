import { type FC, useId } from 'react';
import { useFormContext } from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '../ui/field';
import { Textarea } from '../ui/textarea';

type Props = {
    name: string;
    required: boolean;
    readOnly: boolean;
    label?: string;
};

const AddressField: FC<Props> = ({
    name = 'address',
    required = false,
    readOnly = false,
    label = 'Address',
}) => {
    const { register, getFieldState, formState } = useFormContext();
    const { error } = getFieldState(name, formState);
    const id = useId();

    return (
        <Field data-invalid={!!error} data-testid={`sdk-${name}-field-id`}>
            <FieldLabel htmlFor={id}>
                <span>
                    {label}
                    {required && (
                        <span aria-hidden="true" className="text-destructive">
                            {' '}
                            *
                        </span>
                    )}
                </span>
            </FieldLabel>
            <Textarea
                id={id}
                autoComplete="street-address"
                readOnly={readOnly}
                className="read-only:cursor-not-allowed read-only:bg-input/50"
                aria-invalid={!!error}
                aria-required={required}
                required={required}
                {...register(name, {
                    setValueAs: (value) =>
                        typeof value === 'string' ? value.trim() : value,
                })}
            />
            <FieldError errors={[error]} />
        </Field>
    );
};

export default AddressField;
