import { FC, useState } from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';

import { invoiceLookup } from '../../api/InvoiceApi';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import InputField from '../FormFields/InputField';
import {
    prepareErrorMessage,
    prepareErrorsArrayMessage,
} from '../../utils/helper';
import { InvoiceLookupNetworkEnum } from '../../enums/general';
import { ErrorsMsg } from '../../types/general';

type Props = {
    callback: (value: string) => void;
    onBack: () => void;
    backButtonText?: string;
    verifyButtonText?: string;
    organizationNumberLabel?: string;
    organizationNumber?: string;
    className?: string;
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
    backButtonText = '',
    verifyButtonText = '',
    organizationNumberLabel = '',
    organizationNumber = '',
    className = '',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');
    const [errorsMsg, setErrorsMsg] = useState<string[]>([]);

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

    const onSubmit: SubmitHandler<EHFFormInputsType> = async (
        data
    ): Promise<void> => {
        setApiErrorMsg('');
        setErrorsMsg([]);
        setLoading(true);
        try {
            await invoiceLookup({
                network: InvoiceLookupNetworkEnum.EHF,
                value: data.organizationNumber,
            });
            callback(data.organizationNumber);
        } catch (error) {
            setApiErrorMsg(prepareErrorMessage(error as Error));
            setErrorsMsg(
                prepareErrorsArrayMessage(
                    (
                        error as {
                            errors: ErrorsMsg;
                        }
                    )?.errors
                )
            );
        } finally {
            setLoading(false);
        }
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
