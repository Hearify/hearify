import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { errorToast } from '@src/toasts/toasts';
import { CustomInput } from '@src/components/CustomInput/CustomInput';
import VerificationModal from '@src/components/ChangePasswordEmail/VerificationModal/VerificationModal';
import logoIcon from '../../assets/images/logo.svg';
import styles from './ChangePasswordEmail.module.scss';

import type { FormikHelpers } from 'formik';

const ChangePasswordEmail: React.FC = () => {
  const { t, i18n } = useTranslation('general');
  const [email, setEmail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const sendResetEmail = (email: string): void => {
    axios
      .post(`api/auth/reset_password/generate_link?user_email=${email}`)
      .then(() => {
        setIsSubmitted(true);
      })
      .catch(
        ({
          response: {
            data: { detail },
          },
        }) => {
          errorToast(detail);
          setIsSubmitted(false);
        }
      );
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is a required field'),
  });

  const handleSubmit = (values: { email: string }, { setSubmitting }: FormikHelpers<{ email: string }>): void => {
    sendResetEmail(values.email);
    setEmail(values.email);
    setSubmitting(false);
  };

  const handleBackClick = () => {
    setIsSubmitted(false);
  };

  return (
    <div className={styles.reset_password_container}>
      <div className={styles.logo_container}>
        <Link to="/login">
          <img src={logoIcon} alt="Hearify logo beta" />
        </Link>
      </div>
      {isSubmitted ? (
        <VerificationModal
          email={email}
          sendResetEmail={() => sendResetEmail(email)}
          handleBackClick={handleBackClick}
        />
      ) : (
        <div className={styles.reset_password_form_wrapper}>
          <div className={styles.reset_password_form}>
            <div className={styles.title}>{t('reset_password')}</div>
            <Formik initialValues={{ email }} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ values, handleChange }) => (
                <Form className={styles.reset_password_body}>
                  <div className={styles.body_input}>
                    <CustomInput
                      type="email"
                      label={t('email')}
                      placeholder={t('enter_email')}
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      isMessage
                    />
                  </div>
                  <button className={styles.send_link_btn} type="submit">
                    {t('reset_password_link')}
                  </button>
                </Form>
              )}
            </Formik>
            <div className={styles.nav_btns}>
              <Link className={styles.reset_btn} to="/login">
                {t('back_to_login')}
              </Link>
              <div>
                {t('dont_have_account')}{' '}
                <Link className={styles.reset_btn} to="/signup">
                  {t('sign_up')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordEmail;
