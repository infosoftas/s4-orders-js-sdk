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
    glnLabel?: string;
    className?: string;
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
    backButtonText = '',
    verifyButtonText = '',
    organizationNumberLabel = '',
    glnLabel = '',
    className = '',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');
    const [errorsMsg, setErrorsMsg] = useState<string[]>([]);

    const methods = useForm<OIOFormInputsType>({
        defaultValues: {
            ...initialData,
        },
    });

    const {
        handleSubmit,
        watch,
        formState: { errors },
    } = methods;

    const cvr = watch('cvr');
    const gln = watch('gln');

    const onSubmit: SubmitHandler<OIOFormInputsType> = async (
        data
    ): Promise<void> => {
        setApiErrorMsg('');
        setErrorsMsg([]);
        setLoading(true);
        try {
            await invoiceLookup({
                network: data.gln
                    ? InvoiceLookupNetworkEnum.OIO_GLN
                    : InvoiceLookupNetworkEnum.OIO_Danish_CVR,
                value: data.gln || data.cvr,
            });
            callback(data.gln || data.cvr);
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
