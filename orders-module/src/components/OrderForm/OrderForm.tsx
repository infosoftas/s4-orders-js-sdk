import {
    type FC,
    type KeyboardEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    FormProvider,
    useForm,
    type Resolver,
    type SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PaymentMethodEnum, UserActionEnum } from '../../enums/general';
import { PAYMENT_METHOD_DEFAULT } from '../../constants/index';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import OrderDenialModal from '../OrderDenialModal/OrderDenialModal';
import TermsCheckbox from '../FormFields/TermsCheckbox';
import type { OrderFormInputsType, OrderInfoType } from '../../types/order';
import type {
    PaymentMethodSettingsType,
    PaymentMethodOptionType,
    OrderFormFieldType,
    ContactRequestType,
    OrderDenialFallbackOfferType,
    SubmitConfirmationType,
} from '../../types/general';
import useOrderForm from '../../hooks/useOrderForm';
import { useSlotElement, renderInSlot } from './useSlotElement';
import {
    deriveOrderFormState,
    buildOrderFormSchema,
    type OrderFormConfig,
} from './orderFormState';
import PaymentMethodSection from './PaymentMethodSection';
import ContactDetailsSection from './ContactDetailsSection';
import SubmitConfirmationDialog from './SubmitConfirmationDialog';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
    updateFormData: (data: OrderFormInputsType) => void;
    submitStartCallback?: (id: string) => void;
    userActionCallback?: (
        action: UserActionEnum,
        args: object | null | undefined
    ) => void;
    setContactCallback?: (contactInfo: ContactRequestType) => void;
    templatePackageId: string;
    subscriberId?: string;
    userId?: string;
    identityProviderId?: string;
    organizationId: string;
    redirectUrl?: string;
    showIframe?: boolean;
    language: string;
    merchantAgreementUrl: string;
    paymentMethodsOptions?: PaymentMethodSettingsType;
    defaultValues?: OrderFormInputsType;
    paymentMethods?: PaymentMethodOptionType[];
    allowedPaymentMethods?: PaymentMethodEnum[];
    submitButtonText?: string;
    orderDenialCloseButtonText?: string;
    orderDenialContinueButtonText?: string;
    paymentMethodLabel?: string;
    contactDetailsLabel?: string;
    paymentMethodElementId?: string;
    contactDetailsElementId?: string;
    paymentMethodNotAllowedMsg?: string;
    errorReqMsg?: string;
    errorInvalidEmailMsg?: string;
    errorInvalidPhoneMsg?: string;
    errorTermsMsg?: string;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFieldType[];
        paymentMethods?: PaymentMethodEnum[];
    };
    requireTermsAcceptance?: boolean;
    errorValidationTitleMsg?: string;
    errorValidationDenialOrderBlockingMsg?: string;
    errorValidationBlockingOffersMsg?: string;
    orderDenialOfferBaseText?: string;
    orderDenialOfferWithFallbackText?: string;
    orderDenialAmountText?: string;
    fetchDenialFallbackOffer?: (
        organizationId: string
    ) => Promise<OrderDenialFallbackOfferType | undefined>;
    termsAndConditionsText?: string | ReactNode;
    submitConfirmation?: SubmitConfirmationType;
};

const initialData = {
    invoiceAddressSelection: false,
    name: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: '',
    address: '',
    zip: '',
    paymentMethod: PAYMENT_METHOD_DEFAULT,
    orderReference: '',
};

const OrderForm: FC<Props> = ({
    callback,
    updateFormData,
    submitStartCallback,
    userActionCallback,
    setContactCallback,
    templatePackageId,
    subscriberId,
    userId,
    identityProviderId,
    organizationId,
    redirectUrl,
    showIframe,
    paymentMethodsOptions,
    defaultValues,
    language,
    merchantAgreementUrl,
    paymentMethods = [],
    allowedPaymentMethods,
    invoiceAddressSelection,
    submitButtonText = 'Start',
    orderDenialCloseButtonText = 'Close',
    orderDenialContinueButtonText = 'Continue',
    paymentMethodLabel = 'Select payment method',
    contactDetailsLabel,
    paymentMethodElementId,
    contactDetailsElementId,
    paymentMethodNotAllowedMsg = 'This payment method not allowed!',
    errorReqMsg = '',
    errorInvalidEmailMsg = '',
    errorInvalidPhoneMsg = '',
    errorTermsMsg = '',
    errorValidationTitleMsg,
    errorValidationDenialOrderBlockingMsg,
    errorValidationBlockingOffersMsg,
    orderDenialOfferBaseText,
    orderDenialOfferWithFallbackText,
    orderDenialAmountText,
    fetchDenialFallbackOffer,
    requireTermsAcceptance,
    termsAndConditionsText,
    submitConfirmation,
}) => {
    const subscriberIdValue =
        subscriberId || sessionStorage.getItem('subscriberId') || undefined;

    useEffect(() => {
        if (!templatePackageId)
            console.error('"templatePackageId" should be set');
        if (!organizationId) console.error('"organizationId" should be set');
        if (!userId) console.error('"userId" should be set');
        if (!identityProviderId)
            console.error('"identityProviderId" should be set');
    }, [templatePackageId, organizationId, userId, identityProviderId]);

    const config: OrderFormConfig = {
        paymentMethods,
        paymentMethodsOptions,
        allowedPaymentMethods,
        invoiceAddressSelection,
    };

    const messages = {
        errorReqMsg,
        errorInvalidEmailMsg,
        errorInvalidPhoneMsg,
        errorTermsMsg,
    };

    const configuredPaymentMethods = paymentMethods.map((m) => m.value);
    const initialPaymentMethod = configuredPaymentMethods.length
        ? ([defaultValues?.paymentMethod, PAYMENT_METHOD_DEFAULT].find(
              (m) => m && configuredPaymentMethods.includes(m)
          ) ?? configuredPaymentMethods[0])
        : defaultValues?.paymentMethod || PAYMENT_METHOD_DEFAULT;

    const resolver: Resolver<OrderFormInputsType> = (values, ctx, options) => {
        const schema = buildOrderFormSchema(
            deriveOrderFormState(values, config),
            requireTermsAcceptance,
            messages
        );
        return zodResolver(schema)(values, ctx, options);
    };

    const methods = useForm<OrderFormInputsType>({
        resolver,
        defaultValues: {
            ...initialData,
            ...(defaultValues ?? {}),
            paymentMethod: initialPaymentMethod,
        },
    });

    const { control, handleSubmit, setValue, watch } = methods;

    const derived = deriveOrderFormState(
        {
            paymentMethod: watch('paymentMethod'),
            invoiceAddressSelection: watch('invoiceAddressSelection'),
        },
        config
    );

    useEffect(() => {
        userActionCallback?.(UserActionEnum.SELECT_PAYMENT_METHOD, {
            paymentMethod: methods.getValues('paymentMethod'),
        });
    }, []);

    const {
        orderSubmit,
        continueWithFallbackOffer,
        loading,
        apiErrorMsg,
        errorsMsg,
        orderDenialType,
        orderDenialMessage,
        orderDenialFallbackOffer,
        dismissOrderDenial,
    } = useOrderForm({
        callback,
        submitStartCallback,
        userActionCallback,
        setContactCallback,
        organizationId,
        subscriberId: subscriberIdValue,
        userId,
        identityProviderId,
        orderFields: derived.orderFields,
        redirectUrl,
        showIframe,
        language,
        merchantAgreementUrl,
        paymentMethodsOptions,
        templatePackageId,
        invoiceAddressToggle: watch('invoiceAddressSelection'),
        invoiceOrderFields: derived.invoiceOrderFields,
        errorValidationTitleMsg,
        errorValidationDenialOrderBlockingMsg,
        errorValidationBlockingOffersMsg,
        orderDenialOfferBaseText,
        orderDenialOfferWithFallbackText,
        orderDenialAmountText,
        fetchDenialFallbackOffer,
    });

    const [pendingSubmit, setPendingSubmit] =
        useState<OrderFormInputsType | null>(null);

    const submitOrder = async (data: OrderFormInputsType): Promise<void> => {
        if (
            derived.paymentMethod === PaymentMethodEnum.EHF ||
            derived.paymentMethod === PaymentMethodEnum.OIO
        ) {
            updateFormData?.(data);
            return;
        }
        await orderSubmit(data);
    };

    const onSubmit: SubmitHandler<OrderFormInputsType> = async (data) => {
        if (submitConfirmation) {
            setPendingSubmit(data);
            return;
        }
        await submitOrder(data);
    };

    const confirmSubmit = () => {
        const data = pendingSubmit;
        setPendingSubmit(null);
        if (data) submitOrder(data);
    };

    const handlePaymentChange = (paymentMethod: PaymentMethodEnum) => {
        setValue('paymentMethod', paymentMethod, { shouldValidate: true });
        if (!derived.invoicePaymentMethods.includes(paymentMethod)) {
            setValue('invoiceAddressSelection', false);
        }

        userActionCallback?.(UserActionEnum.SELECT_PAYMENT_METHOD, {
            paymentMethod,
        });
    };

    const paymentMethodSlot = useSlotElement(paymentMethodElementId);
    const contactDetailsSlot = useSlotElement(contactDetailsElementId);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSlotKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' || event.defaultPrevented) return;
        if (!derived.allowPaymentMethod || loading) return;

        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT') return;

        const { type } = target as HTMLInputElement;
        if (type === 'button' || type === 'submit' || type === 'reset') return;

        event.preventDefault();
        formRef.current?.requestSubmit();
    };

    const paymentMethodSection = derived.showPaymentMethodSelection ? (
        <PaymentMethodSection
            control={control}
            paymentMethods={paymentMethods}
            label={paymentMethodLabel}
            onChange={handlePaymentChange}
        />
    ) : null;

    const contactDetailsSection = derived.showContactDetails ? (
        <ContactDetailsSection
            label={contactDetailsLabel}
            orderFields={derived.orderFields}
            invoiceOrderFields={derived.invoiceOrderFields}
            showOrderFields={derived.showOrderFields}
            showInvoiceToggle={derived.showInvoiceToggle}
            showInvoiceFields={derived.showInvoiceFields}
            invoiceToggleLabel={invoiceAddressSelection?.label}
            onInvoiceToggle={(value) =>
                userActionCallback?.(UserActionEnum.TOGGLE_INVOICE_ADDRESS, {
                    value,
                })
            }
        />
    ) : null;

    return (
        <FormProvider {...methods}>
            <form
                ref={formRef}
                className="sdk-order-form flex w-full flex-col gap-6"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                data-testid="sdk-order-form-id"
            >
                {renderInSlot(
                    paymentMethodSection,
                    paymentMethodSlot,
                    handleSlotKeyDown
                )}
                {renderInSlot(
                    contactDetailsSection,
                    contactDetailsSlot,
                    handleSlotKeyDown
                )}
                <div className="sdk-order-actions-section flex flex-col gap-4">
                    {requireTermsAcceptance && (
                        <TermsCheckbox
                            name="termsAccept"
                            label={termsAndConditionsText}
                            required
                        />
                    )}
                    {derived.allowPaymentMethod && (
                        <Button
                            type="submit"
                            loading={loading}
                            buttonText={submitButtonText}
                            className="w-full"
                        />
                    )}
                    <Alert
                        msg={
                            derived.allowPaymentMethod
                                ? apiErrorMsg
                                : paymentMethodNotAllowedMsg
                        }
                    />
                    {errorsMsg?.length > 0 &&
                        derived.allowPaymentMethod &&
                        errorsMsg.map((i, index) => (
                            <Alert key={`${i}-${index}`} msg={i} />
                        ))}
                </div>
                {submitConfirmation && (
                    <SubmitConfirmationDialog
                        isOpen={!!pendingSubmit}
                        confirmation={submitConfirmation}
                        onConfirm={confirmSubmit}
                        onCancel={() => setPendingSubmit(null)}
                    />
                )}
                <OrderDenialModal
                    isOpen={!!orderDenialType}
                    message={orderDenialMessage}
                    closeButtonText={orderDenialCloseButtonText}
                    continueButtonText={orderDenialContinueButtonText}
                    canContinue={
                        orderDenialType === 'offer' &&
                        !!orderDenialFallbackOffer?.templatePackageId
                    }
                    offer={
                        orderDenialType === 'offer' &&
                        !!orderDenialFallbackOffer?.templatePackageId
                            ? orderDenialFallbackOffer
                            : undefined
                    }
                    onClose={dismissOrderDenial}
                    onContinue={continueWithFallbackOffer}
                />
            </form>
        </FormProvider>
    );
};

export default OrderForm;
