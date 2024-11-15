import EmailField from 'Component/FormFields/EmailField';
import PhoneField from 'Component/FormFields/PhoneField';
import NameField from 'Component/FormFields/NameField';
import AddressField from 'Component/FormFields/AddressField';
import InputField from 'Component/FormFields/InputField';

import { FIELD_TYPES } from './FormFields.helper';

const formFieldsMapper = {
    [FIELD_TYPES.PHONE]: PhoneField,
    [FIELD_TYPES.NAME]: NameField,
    [FIELD_TYPES.EMAIL]: EmailField,
    [FIELD_TYPES.ADDRESS]: AddressField,
    [FIELD_TYPES.COUNTRY]: InputField,
    [FIELD_TYPES.CITY]: InputField,
    [FIELD_TYPES.ZIP]: InputField,
};

export default formFieldsMapper;
