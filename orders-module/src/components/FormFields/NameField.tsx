import { type FC, useId } from 'react';
import { useFormContext } from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

type Props = {
    name: string;
    required: boolean;
    readOnly: boolean;
    label?: string;
};

const NameField: FC<Props> = ({
    name = 'name',
    required = false,
    readOnly = false,
    label = 'Name',
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
            <Input
                id={id}
                autoComplete="name"
                readOnly={readOnly}
                className="read-only:cursor-not-allowed read-only:bg-input/50"
                aria-invalid={!!error}
                aria-required={required}
                required={required}
                {...register(name)}
            />
            <FieldError errors={[error]} />
        </Field>
    );
};

export default NameField;
