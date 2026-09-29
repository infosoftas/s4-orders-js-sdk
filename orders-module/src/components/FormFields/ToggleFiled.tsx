import { FC, useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Field, FieldLabel } from '../ui/field';
import { Switch } from '../ui/switch';

type Props = {
    name: string;
    readOnly?: boolean;
    label?: string;
    toggleCallback?: (value: boolean) => void;
};

const ToggleField: FC<Props> = ({
    name,
    readOnly = false,
    label = '',
    toggleCallback,
}) => {
    const { control } = useFormContext();
    const id = useId();

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={false}
            render={({ field }) => (
                <Field
                    orientation="horizontal"
                    data-testid={`sdk-${name}-field-id`}
                >
                    <FieldLabel htmlFor={id}>{label}</FieldLabel>
                    <Switch
                        id={id}
                        name={field.name}
                        checked={!!field.value}
                        onCheckedChange={(checked) => {
                            field.onChange(checked);
                            toggleCallback?.(checked);
                        }}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        readOnly={readOnly}
                    />
                </Field>
            )}
        />
    );
};

export default ToggleField;
