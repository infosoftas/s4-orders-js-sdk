import { FIELD_TYPES } from './FormFields.helper';

import EmailField from 'Component/FormFields/EmailField';
import PhoneField from 'Component/FormFields/PhoneField';
import NameField from 'Component/FormFields/NameField';

const formFieldsMapper = {
    [FIELD_TYPES.PHONE]: PhoneField,
    [FIELD_TYPES.NAME]: NameField,
    [FIELD_TYPES.EMAIL]: EmailField,
};

export default formFieldsMapper;
