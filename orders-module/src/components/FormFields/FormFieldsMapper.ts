import { lazy } from 'react';
import { FIELD_TYPES } from './FormFields.helper';

const EmailField = lazy(() => import('./EmailField'));
const PhoneField = lazy(() => import('./PhoneField'));
const NameField = lazy(() => import('./NameField'));

const formFieldsMapper = {
    [FIELD_TYPES.PHONE]: PhoneField,
    [FIELD_TYPES.NAME]: NameField,
    [FIELD_TYPES.EMAIL]: EmailField,
};

export default formFieldsMapper;
