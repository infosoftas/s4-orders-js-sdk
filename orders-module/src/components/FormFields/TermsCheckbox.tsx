import { FC, ReactNode, useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Checkbox } from '../ui/checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '../ui/field';

type Props = {
    name: string;
    required: boolean;
    disabled?: boolean;
    label?: string | ReactNode;
};

const TermsCheckbox: FC<Props> = ({
    name,
    required = true,
    disabled = false,
    label = 'I accept the terms and conditions',
}) => {
    const { control } = useFormContext();
    const id = useId();

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={false}
            render={({ field, fieldState }) => (
                <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                    data-disabled={disabled}
                    data-testid={`sdk-${name}-field-id`}
                >
                    <Checkbox
                        id={id}
                        name={field.name}
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        disabled={disabled}
                        aria-invalid={fieldState.invalid}
                        aria-required={required}
                        required={required}
                    />
                    <FieldContent>
                        <FieldLabel htmlFor={id}>
                            <span>
                                {label}
                                {required && (
                                    <span
                                        aria-hidden="true"
                                        className="text-destructive"
                                    >
                                        {' '}
                                        *
                                    </span>
                                )}
                            </span>
                        </FieldLabel>
                        <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                </Field>
            )}
        />
    );
};

export default TermsCheckbox;
