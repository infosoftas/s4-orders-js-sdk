import { FC } from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';

import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import InputField from '../FormFields/InputField';
import { DEFAULT_ORDER_FORM_FIELDS } from '../FormFields/FormFields.helper';

import { PaymentMethodEnum, UserActionEnum } from '../../enums/general';
import {
    OrderFormFiledType,
    PaymentMethodOptionsType,
} from '../../types/general';
import useOrderForm from '../../hooks/useOrderForm';
import { orderInvoiceContactFields } from '../../utils/order.helper';
import { OrderFormInputsType, OrderInfoType } from '../../types/order';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
    onBack: () => void;
    submitStartCallback?: (id: string) => void;
    userActionCallback?: (action: UserActionEnum, args: object | null | undefined) => void;
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
    invoiceLookupNotFoundText?: string;
};

type OIOFormInputsType = {
    cvr: string;
    gln: string;
};

const initialData = {
    cvr: '',
    gln: '',
};

const EHFForm: FC<Props> = ({
    callback,
    onBack,
    submitStartCallback,
    userActionCallback,
    className = '',
    backButtonText = '',
    verifyButtonText = '',
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
}) => {
    const methods = useForm<OIOFormInputsType>({
        defaultValues: {
            ...initialData,
            cvr: organizationNumber,
        },
    });

    const {
        handleSubmit,
        watch,
        formState: { errors },
    } = methods;

    const cvr = watch('cvr');
    const gln = watch('gln');

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
        invoiceLookupNotFoundText,
    });

    const onSubmit: SubmitHandler<OIOFormInputsType> = async (
        data
    ): Promise<void> => {
        orderSubmit({ ...orderValues, gln: data.gln, cvr: data.cvr });
    };

    const handleBack = () => {
        userActionCallback?.(UserActionEnum.RETURN_TO_MAIN, null);
        onBack?.();
    };

    return (
        <FormProvider {...methods}>
            <form
                className={`${className}`}
                onSubmit={handleSubmit(onSubmit)}
                data-testid="oio-form-id"
            >
                <InputField
                    name="cvr"
                    label={organizationNumberLabel}
                    required={!gln}
                    readOnly={false}
                    errors={!gln ? errors : undefined}
                />
                <InputField
                    name="gln"
                    label={glnLabel}
                    required={!cvr}
                    readOnly={false}
                    errors={!cvr ? errors : undefined}
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
