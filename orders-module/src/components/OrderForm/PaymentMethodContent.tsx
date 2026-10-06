import type { FC } from 'react';
import { cn } from 'cn';

import type { PaymentMethodOptionType } from '../../types/general';
import { FieldDescription, FieldTitle } from '../ui/field';

type Props = {
    method: PaymentMethodOptionType;
};

const PaymentMethodContent: FC<Props> = ({ method }) => {
    const hasIcons = !!method.icons?.length;

    if (!hasIcons) {
        return (
            <div className="flex flex-1 flex-col gap-0.5">
                <FieldTitle className="sdk-payment-method-label">
                    {method.label}
                </FieldTitle>
                {method.description && (
                    <FieldDescription className="sdk-payment-method-description">
                        {method.description}
                    </FieldDescription>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-0.5">
            <FieldTitle className="sdk-payment-method-icons min-h-5 flex-wrap items-center gap-1.5">
                {method.description && (
                    <span className="sdk-payment-method-label sr-only">
                        {method.label}
                    </span>
                )}
                {method.icons?.map((icon) => (
                    <img
                        key={icon.src}
                        src={icon.src}
                        alt={icon.alt ?? ''}
                        className={cn(
                            'h-5 w-auto object-contain',
                            icon.className
                        )}
                    />
                ))}
            </FieldTitle>
            {method.description ? (
                <FieldDescription className="sdk-payment-method-description">
                    {method.description}
                </FieldDescription>
            ) : (
                <FieldDescription className="sdk-payment-method-label">
                    {method.label}
                </FieldDescription>
            )}
        </div>
    );
};

export default PaymentMethodContent;
