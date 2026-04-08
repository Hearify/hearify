import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import axios from '@src/api/axios';
import { CustomInput } from '@src/components/CustomInput/CustomInput';
import logoIcon from '@src/assets/images/logo.svg';
import PasswordUpdatedModal from '@src/components/ChangePasswordEmail/ResetPassword/PasswordUpdatedModal/PasswordUpdatedModal';
import styles from './ResetPassword.module.scss';

import type { FormikHelpers } from 'formik';

interface ResetPasswordValues {
  password: string;
}

const ResetPassword = () => {
  const { t } = useTranslation('general');
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const { reset_token } = useParams<{ reset_token: string }>();
  const [isChanged, setIsChanged] = useState(false);

  const validationSchema = Yup.object({
    password: Yup.string().min(8, 'Password must have at least 8 characters').required('Password is a required field'),
  });

  const handleSubmit = async (values: ResetPasswordValues, { setSubmitting }: FormikHelpers<ResetPasswordValues>) => {
    try {
      const response = await axios.post(
        `api/auth/reset_password/set_new_password?reset_token=${reset_token}&new_password=${values.password}`
      );
      setIsChanged(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo_container}>
        <Link to="/login">
          <img src={logoIcon} alt="Hearify logo beta" />
        </Link>
      </div>
      {isChanged ? (
        <PasswordUpdatedModal />
      ) : (
        <div className={styles.reset_wrapper}>
          <div className={styles.container}>
            <div className={styles.title}>{t('enter_new_password')}</div>
            <div className={styles.reset_form_wrapper}>
              <Formik initialValues={{ password: '' }} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ values, handleChange }) => (
                  <Form className={styles.form_wrapper}>
                    <div className={styles.input_wrapper}>
                      <CustomInput
                        type={passwordVisibility ? 'text' : 'password'}
                        placeholder={t('enter_new_password')}
                        label={t('password')}
                        name="password"
                        style={{ width: '100%' }}
                        value={values.password}
                        onChange={handleChange}
                        isMessage
                      />
                      <div className={styles.eye_wrapper} onClick={() => setPasswordVisibility(!passwordVisibility)}>
                        <Icon path={passwordVisibility ? mdiEyeOff : mdiEye} size={0.9} />
                      </div>
                    </div>
                    <button className={styles.reset_btn} type="submit">
                      {t('reset_password')}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
