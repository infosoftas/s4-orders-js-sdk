import EmailField from './EmailField';
import PhoneField from './PhoneField';
import NameField from './NameField';
import AddressField from './AddressField';
import InputField from './InputField';

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
