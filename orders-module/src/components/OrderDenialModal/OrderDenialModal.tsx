import { FC } from 'react';
import { createPortal } from 'react-dom';

import { OrderDenialFallbackOfferType } from '../../types/general';
import Button from '../Button/Button';

import './orderDenialModal.scss';

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
    if (!isOpen || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            className="sdk-order-denial-modal-overlay"
            data-testid="sdk-order-denial-modal-overlay"
        >
            <div
                className="sdk-order-denial-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Order denial modal"
            >
                <p className="sdk-order-denial-modal-text">
                    {message?.split('\\n').map((line, i, arr) => (
                        <span key={i}>
                            {line}
                            {i < arr.length - 1 && <br />}
                        </span>
                    ))}
                </p>
                {offer?.title && offer?.templatePackageId && (
                    <div className="sdk-order-denial-offer-box">
                        <h4 className="sdk-order-denial-offer-title">
                            {offer.title}
                        </h4>
                        {offer.description && (
                            <p className="sdk-order-denial-offer-description">
                                {offer.description}
                            </p>
                        )}
                        {offer.price && (
                            <p className="sdk-order-denial-offer-meta">
                                {offer.price}
                            </p>
                        )}
                    </div>
                )}
                <div className="sdk-order-denial-modal-actions">
                    <Button
                        type="button"
                        btnType="default"
                        buttonText={closeButtonText}
                        onClick={onClose}
                    />
                    {canContinue && (
                        <Button
                            type="button"
                            buttonText={continueButtonText}
                            onClick={onContinue}
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OrderDenialModal;
