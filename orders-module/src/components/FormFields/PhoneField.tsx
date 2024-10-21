import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
    name: string;
    required: boolean;
    errors?: {
        phoneNumber?: {
            message?: string;
        };
    };
};

const PhoneFiled: FC<Props> = ({ required = false, errors }) => {
    const { register } = useFormContext();
    return (
        <div className="field-wrapper" data-testid="sdk-phone-field-id">
            <input
                autoComplete="tel"
                className="input-control"
                placeholder=" "
                type="tel"
                {...register('phoneNumber', {
                    required: required ? 'This field is required!' : false,
                    pattern: {
                        value: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]{6,14}$/g,
                        message: 'Invalid phone address!',
                    },
                })}
            />
            <label className="label-control">
                Phone number {required && <span className="text-error">*</span>}
            </label>
            {errors && errors.phoneNumber && (
                <div className="text-error caption">
                    {errors.phoneNumber.message}
                </div>
            )}
        </div>
    );
};

export default PhoneFiled;
