import { FC, useId } from 'react';
import { Control, Controller } from 'react-hook-form';

import { PaymentMethodEnum } from '../../enums/general';
import { PaymentMethodOptionType } from '../../types/general';
import { OrderFormInputsType } from '../../types/order';
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '../ui/field';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import PaymentMethodContent from './PaymentMethodContent';

type Props = {
    control: Control<OrderFormInputsType>;
    paymentMethods: PaymentMethodOptionType[];
    label?: string;
    onChange: (paymentMethod: PaymentMethodEnum) => void;
};

const PaymentMethodSection: FC<Props> = ({
    control,
    paymentMethods,
    label,
    onChange,
}) => {
    const groupId = useId();

    return (
        <div className="sdk-payment-method-section">
            <Controller
                name="paymentMethod"
                control={control}
                render={({ field, fieldState }) => (
                    <FieldSet data-invalid={fieldState.invalid}>
                        {label && (
                            <FieldLegend variant="label">{label}</FieldLegend>
                        )}
                        <RadioGroup
                            name={field.name}
                            value={field.value}
                            onValueChange={(value) =>
                                onChange(value as PaymentMethodEnum)
                            }
                            inputRef={field.ref}
                            aria-invalid={fieldState.invalid}
                        >
                            {paymentMethods.map((item) => {
                                const itemId = `${groupId}-${item.value}`;

                                return (
                                    <FieldLabel
                                        key={item.value}
                                        htmlFor={itemId}
                                        className="*:data-[slot=field]:p-3 sm:*:data-[slot=field]:p-4"
                                    >
                                        <Field
                                            orientation="horizontal"
                                            data-payment-method={item.value}
                                        >
                                            <RadioGroupItem
                                                id={itemId}
                                                value={item.value}
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <PaymentMethodContent
                                                method={item}
                                            />
                                        </Field>
                                    </FieldLabel>
                                );
                            })}
                        </RadioGroup>
                        <FieldError errors={[fieldState.error]} />
                    </FieldSet>
                )}
            />
        </div>
    );
};

export default PaymentMethodSection;
