import { FC } from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';

import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import InputField from '../FormFields/InputField';
import { PaymentMethodEnum } from '../../enums/general';
import {
    OrderFormFiledType,
    PaymentMethodOptionsType,
} from '../../types/general';
import { OrderFormInputsType, OrderInfoType } from '../../types/order';
import { orderInvoiceContactFields } from '../../utils/order.helper';
import useOrderForm from '../../hooks/useOrderForm';
import { DEFAULT_ORDER_FORM_FIELDS } from '../FormFields/FormFields.helper';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
    onBack: () => void;
    submitStartCallback?: (id: string) => void;
    className?: string;
    backButtonText?: string;
    verifyButtonText?: string;
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
    paymentMethodsOptions?: PaymentMethodOptionsType;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFiledType[];
        paymentMethods?: PaymentMethodEnum[];
    };
};

type EHFFormInputsType = {
    organizationNumber: string;
};

const initialData = {
    organizationNumber: '',
};

const EHFForm: FC<Props> = ({
    callback,
    onBack,
    submitStartCallback,
    className = '',
    backButtonText = '',
    verifyButtonText = '',
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
}) => {
    const methods = useForm<EHFFormInputsType>({
        defaultValues: {
            ...initialData,
            organizationNumber,
        },
    });

    const {
        handleSubmit,
        formState: { errors },
    } = methods;

    const invoiceOrderFields =
        invoiceAddressSelection?.fields || orderInvoiceContactFields;

    const orderFields =
        paymentMethodsOptions?.[orderValues?.paymentMethod as PaymentMethodEnum]
            ?.orderFormFields ?? DEFAULT_ORDER_FORM_FIELDS;

    const { orderSubmit, loading, apiErrorMsg, errorsMsg } = useOrderForm({
        callback,
        submitStartCallback,
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
        onBack?.();
    };

    return (
        <FormProvider {...methods}>
            <form
                className={`${className}`}
                onSubmit={handleSubmit(onSubmit)}
                data-testid="ehf-form-id"
            >
                <InputField
                    name="organizationNumber"
                    label={organizationNumberLabel}
                    required
                    readOnly={false}
                    errors={errors}
                />
                <div className="d-flex justify-center flex-wrap gap-2">
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
                    errorsMsg.map((i) => <Alert className="mt-2" msg={i} />)}
            </form>
        </FormProvider>
    );
};

export default EHFForm;
