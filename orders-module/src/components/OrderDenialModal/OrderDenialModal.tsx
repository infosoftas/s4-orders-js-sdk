import { FC } from 'react';

import { OrderDenialFallbackOfferType } from '../../types/general';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

type Props = {
    isOpen: boolean;
    message?: string;
    offer?: OrderDenialFallbackOfferType;
    canContinue?: boolean;
    closeButtonText?: string;
    continueButtonText?: string;
    onContinue: () => void;
    onClose: () => void;
};

const splitMessage = (message = '') => {
    const [title = '', ...rest] = message
        .replace(/\\n/g, '\n')
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean);

    return { title, description: rest.join('\n\n') };
};

const OrderDenialModal: FC<Props> = ({
    isOpen,
    message,
    offer,
    canContinue = true,
    closeButtonText = 'Close',
    continueButtonText = 'Continue',
    onContinue,
    onClose,
}) => {
    const { title, description } = splitMessage(message);
    const showOffer = !!offer?.title && !!offer?.templatePackageId;

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <AlertDialogContent data-testid="sdk-order-denial-modal">
                <AlertDialogHeader>
                    <AlertDialogTitle className="whitespace-pre-line">
                        {title}
                    </AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription className="whitespace-pre-line">
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                {showOffer && (
                    <div
                        className="flex flex-col gap-1 rounded-2xl bg-muted p-4 text-sm"
                        data-testid="sdk-order-denial-offer"
                    >
                        <p className="font-medium">{offer?.title}</p>
                        {offer?.description && (
                            <p className="text-muted-foreground">
                                {offer.description}
                            </p>
                        )}
                        {offer?.price && (
                            <p className="mt-1 font-semibold tabular-nums">
                                {offer.price}
                            </p>
                        )}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel variant="ghost">
                        {closeButtonText}
                    </AlertDialogCancel>
                    {canContinue && (
                        <AlertDialogAction onClick={onContinue}>
                            {continueButtonText}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default OrderDenialModal;
