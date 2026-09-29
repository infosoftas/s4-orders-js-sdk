import { FC, useId, useMemo } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import OrderDenialModal from '../OrderDenialModal/OrderDenialModal';
import { DEFAULT_ORDER_FORM_FIELDS } from '../FormFields/FormFields.helper';

import { PaymentMethodEnum, UserActionEnum } from '../../enums/general';
import {
    OrderFormFieldType,
    PaymentMethodSettingsType,
    ContactRequestType,
    OrderDenialFallbackOfferType,
} from '../../types/general';
import useOrderForm from '../../hooks/useOrderForm';
import { orderInvoiceContactFields } from '../../utils/order.helper';
import { OrderFormInputsType, OrderInfoType } from '../../types/order';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldGroup, FieldLabel, FieldError } from '../ui/field';
import { Input } from '../ui/input';

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

type OIOFormInputsType = {
    cvr: string;
    gln: string;
};

const initialData = {
    cvr: '',
    gln: '',
};

const buildFormSchema = (errorReqMsg?: string) =>
    z
        .object({
            cvr: z.string(),
            gln: z.string(),
        })
        .superRefine((data, ctx) => {
            if (!data.cvr && !data.gln) {
                const message = errorReqMsg || 'This field is required!';
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message,
                    path: ['cvr'],
                });
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message,
                    path: ['gln'],
                });
            }
        });

const OIOForm: FC<Props> = ({
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
    glnLabel = '',
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
    const cvrId = useId();
    const glnId = useId();

    const formSchema = useMemo(
        () => buildFormSchema(errorReqMsg),
        [errorReqMsg]
    );

    const form = useForm<OIOFormInputsType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...initialData,
            cvr: organizationNumber,
        },
    });

    const { handleSubmit } = form;

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

    const onSubmit: SubmitHandler<OIOFormInputsType> = async (
        data
    ): Promise<void> => {
        await orderSubmit({ ...orderValues, gln: data.gln, cvr: data.cvr });
    };

    const handleBack = () => {
        userActionCallback?.(UserActionEnum.RETURN_TO_MAIN, null);
        onBack?.();
    };

    return (
        <form
            className={`${className}`}
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            data-testid="oio-form-id"
        >
            <FieldGroup>
                <Controller
                    name="cvr"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={cvrId}>
                                {organizationNumberLabel}
                            </FieldLabel>
                            <Input
                                {...field}
                                id={cvrId}
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                            />
                            {fieldState.error && (
                                <FieldError>
                                    {fieldState.error.message}
                                </FieldError>
                            )}
                        </Field>
                    )}
                />

                <Controller
                    name="gln"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={glnId}>{glnLabel}</FieldLabel>
                            <Input
                                {...field}
                                id={glnId}
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                            />
                            {fieldState.error && (
                                <FieldError>
                                    {fieldState.error.message}
                                </FieldError>
                            )}
                        </Field>
                    )}
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
                    <Alert key={`${i}-${index}`} className="mt-2" msg={i} />
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
    );
};

export default OIOForm;
