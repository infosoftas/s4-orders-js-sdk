import { FC, useMemo } from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import OrderDenialModal from '../OrderDenialModal/OrderDenialModal';
import InputField from '../FormFields/InputField';
import { FieldGroup } from '../ui/field';
import { PaymentMethodEnum, UserActionEnum } from '../../enums/general';
import {
    OrderFormFieldType,
    PaymentMethodSettingsType,
    ContactRequestType,
    OrderDenialFallbackOfferType,
} from '../../types/general';
import { OrderFormInputsType, OrderInfoType } from '../../types/order';
import { orderInvoiceContactFields } from '../../utils/order.helper';
import useOrderForm from '../../hooks/useOrderForm';
import { DEFAULT_ORDER_FORM_FIELDS } from '../FormFields/FormFields.helper';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
    onBack: () => void;
    submitStartCallback?: (id: string) => void;
    userActionCallback?: (
        action: UserActionEnum,
        args: object | null | undefined
    ) => void;
    setContactCallback?: (contactInfo: ContactRequestType) => void;
    className?: string;
    backButtonText?: string;
    verifyButtonText?: string;
    orderDenialCloseButtonText?: string;
    orderDenialContinueButtonText?: string;
    organizationNumberLabel?: string;
    organizationNumber?: string;
    glnLabel?: string;
    templatePackageId: string;
    subscriberId?: string;
    userId?: string;
    identityProviderId?: string;
    organizationId: string;
    redirectUrl?: string;
    showIframe?: boolean;
    language: string;
    merchantAgreementUrl: string;
    orderValues?: OrderFormInputsType;
    paymentMethodsOptions?: PaymentMethodSettingsType;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFieldType[];
        paymentMethods?: PaymentMethodEnum[];
    };
    invoiceLookupNotFoundText?: string;
    errorReqMsg?: string;
    errorValidationTitleMsg?: string;
    errorValidationDenialOrderBlockingMsg?: string;
    errorValidationBlockingOffersMsg?: string;
    orderDenialOfferBaseText?: string;
    orderDenialOfferWithFallbackText?: string;
    orderDenialAmountText?: string;
    fetchDenialFallbackOffer?: (
        organizationId: string
    ) => Promise<OrderDenialFallbackOfferType | undefined>;
};

const buildFormSchema = (errorReqMsg?: string) => {
    const message = errorReqMsg || 'This field is required!';

    return z.object({
        organizationNumber: z.string().min(1, message).regex(/\S/, message),
    });
};

type EHFFormInputsType = { organizationNumber: string };

const initialData = {
    organizationNumber: '',
};

const EHFForm: FC<Props> = ({
    callback,
    onBack,
    submitStartCallback,
    userActionCallback,
    setContactCallback,
    className = '',
    backButtonText = '',
    verifyButtonText = '',
    orderDenialCloseButtonText = 'Close',
    orderDenialContinueButtonText = 'Continue',
    organizationNumberLabel = '',
    organizationNumber = '',
    templatePackageId,
    subscriberId,
    userId,
    identityProviderId,
    organizationId,
    redirectUrl,
    showIframe,
    language,
    merchantAgreementUrl,
    orderValues,
    paymentMethodsOptions,
    invoiceAddressSelection,
    invoiceLookupNotFoundText,
    errorReqMsg,
    errorValidationTitleMsg,
    errorValidationDenialOrderBlockingMsg,
    errorValidationBlockingOffersMsg,
    orderDenialOfferBaseText,
    orderDenialOfferWithFallbackText,
    orderDenialAmountText,
    fetchDenialFallbackOffer,
}) => {
    const formSchema = useMemo(
        () => buildFormSchema(errorReqMsg),
        [errorReqMsg]
    );

    const methods = useForm<EHFFormInputsType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...initialData,
            organizationNumber,
        },
    });

    const { handleSubmit } = methods;

    const invoiceOrderFields =
        invoiceAddressSelection?.fields || orderInvoiceContactFields;

    const orderFields =
        paymentMethodsOptions?.[orderValues?.paymentMethod as PaymentMethodEnum]
            ?.orderFormFields ?? DEFAULT_ORDER_FORM_FIELDS;

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
        subscriberId,
        userId,
        identityProviderId,
        orderFields,
        redirectUrl,
        showIframe,
        language,
        merchantAgreementUrl,
        paymentMethodsOptions,
        templatePackageId,
        invoiceAddressToggle: orderValues?.invoiceAddressSelection,
        invoiceOrderFields,
        invoiceLookupNotFoundText,
        errorValidationTitleMsg,
        errorValidationDenialOrderBlockingMsg,
        errorValidationBlockingOffersMsg,
        orderDenialOfferBaseText,
        orderDenialOfferWithFallbackText,
        orderDenialAmountText,
        fetchDenialFallbackOffer,
    });

    const onSubmit: SubmitHandler<EHFFormInputsType> = async (
        data
    ): Promise<void> => {
        orderSubmit({
            ...orderValues,
            organizationNumber: data.organizationNumber,
        });
    };

    const handleBack = () => {
        userActionCallback?.(UserActionEnum.RETURN_TO_MAIN, null);
        onBack?.();
    };

    return (
        <FormProvider {...methods}>
            <form
                className={`${className}`}
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                data-testid="ehf-form-id"
            >
                <FieldGroup className="mb-5">
                    <InputField
                        name="organizationNumber"
                        label={organizationNumberLabel}
                        required
                        readOnly={false}
                    />
                </FieldGroup>
                <div className="flex justify-center flex-wrap gap-2">
                    <Button
                        type="button"
                        btnType="default"
                        disable={loading}
                        buttonText={backButtonText}
                        onClick={handleBack}
                    />

                    <Button
                        type="submit"
                        loading={loading}
                        buttonText={verifyButtonText}
                    />
                </div>

                {apiErrorMsg && <Alert className="mt-2" msg={apiErrorMsg} />}
                {errorsMsg?.length > 0 &&
                    errorsMsg.map((i, index) => (
                        <Alert key={index} className="mt-2" msg={i} />
                    ))}
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

export default EHFForm;
