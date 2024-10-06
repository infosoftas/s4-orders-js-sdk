import EmailField from 'Component/FormFields/EmailField';
import PhoneField from 'Component/FormFields/PhoneField';
import NameField from 'Component/FormFields/NameField';

import { FIELD_TYPES } from './FormFields.helper';

const formFieldsMapper = {
    [FIELD_TYPES.PHONE]: PhoneField,
    [FIELD_TYPES.NAME]: NameField,
    [FIELD_TYPES.EMAIL]: EmailField,
};

export default formFieldsMapper;
