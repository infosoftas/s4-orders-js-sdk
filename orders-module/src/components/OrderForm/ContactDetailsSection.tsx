import { FC } from 'react';

import formFieldsMapper from '../FormFields/FormFieldsMapper';
import ToggleField from '../FormFields/ToggleFiled';
import { OrderFormFieldType } from '../../types/general';
import { FieldGroup, FieldLegend, FieldSet } from '../ui/field';

type FieldListProps = {
    fields: OrderFormFieldType[];
};

const FieldList: FC<FieldListProps> = ({ fields }) => (
    <>
        {fields.map((field) => {
            const Component = formFieldsMapper[field.name];

            return Component ? (
                <Component
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    required={field.required || false}
                    readOnly={field.readOnly || false}
                />
            ) : null;
        })}
    </>
);

type Props = {
    label?: string;
    orderFields: OrderFormFieldType[];
    invoiceOrderFields: OrderFormFieldType[];
    showOrderFields: boolean;
    showInvoiceToggle: boolean;
    showInvoiceFields: boolean;
    invoiceToggleLabel?: string;
    onInvoiceToggle?: (value: boolean) => void;
};

const ContactDetailsSection: FC<Props> = ({
    label,
    orderFields,
    invoiceOrderFields,
    showOrderFields,
    showInvoiceToggle,
    showInvoiceFields,
    invoiceToggleLabel,
    onInvoiceToggle,
}) => (
    <div className="sdk-order-details-section">
        <FieldSet>
            {label && <FieldLegend variant="label">{label}</FieldLegend>}
            <FieldGroup>
                {showOrderFields && <FieldList fields={orderFields} />}
                {showInvoiceToggle && (
                    <ToggleField
                        name="invoiceAddressSelection"
                        label={invoiceToggleLabel ?? 'Invoice Address'}
                        toggleCallback={onInvoiceToggle}
                    />
                )}
                {showInvoiceFields && (
                    <FieldList fields={invoiceOrderFields} />
                )}
            </FieldGroup>
        </FieldSet>
    </div>
);

export default ContactDetailsSection;
