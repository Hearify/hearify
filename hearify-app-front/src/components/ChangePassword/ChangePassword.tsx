import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff } from '@mdi/js';

import axios from '@src/api/axios';
import { errorToast, successToast } from '@src/toasts/toasts';
import Button from '@src/components/Button/Button';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal';
import styles from '@src/pages/Settings/Settings.module.scss';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

const ChangePassword = () => {
  const { t } = useTranslation('general');
  const { isModalOpened, openModal, closeModal } = useConfirmationModal();

  const [isPassword, setIsPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);

  useEffect(() => {
    axios.get('/api/users/me/have_password').then((res) => {
      setIsPassword(res.data);
    });
  }, []);

  const handleSubmit = async (
    values: { old_password: string; new_password: string },
    { setSubmitting }: { setSubmitting: any }
  ) => {
    try {
      await axios.post('/api/auth/password', values);
      setSubmitting(false);
      closeModal();
      successToast(t('changed_password'));
    } catch (err: any) {
      openModal;
      if (err.response && err.response.data && err.response.data.detail) {
        const { detail } = err.response.data;
        errorToast(detail);
      }
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object({
    old_password: Yup.string().required('This field is required'),
    new_password: Yup.string().min(8, 'Password must have at least 8 characters').required('This field is required'),
    new_password_again: Yup.string()
      .min(8, 'Password must have at least 8 characters')
      .required('This field is required')
      .oneOf([Yup.ref('new_password')], 'Your passwords do not match.'),
  });

  return (
    <div className={`${styles.changePassword} ${styles.background}`}>
      <div className={styles.changePasswordInner}>
        <h3 className={styles.userInfoTitle}>{t('change_password')}</h3>
        {!isPassword && <p className={styles.errorMessage}>{t('is_not_password')}</p>}
        <div className={styles.inputsWrapper}>
          <Formik
            initialValues={{
              old_password: '',
              new_password: '',
              new_password_again: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {(formik) => (
              <div className={styles.changePasswordContainer}>
                <div className={styles.changePasswordInputs}>
                  <label htmlFor="Old Password" className={styles.label}>
                    <span className={styles.inputLabel}>{t('old_password')}</span>
                    <input
                      type="password"
                      placeholder={t('enter_your_password')}
                      onChange={formik.handleChange('old_password')}
                      className={styles.input}
                      disabled={!isPassword}
                    />
                    {formik.errors.old_password && <p className={styles.formError}>{formik.errors.old_password}</p>}
                  </label>
                  <label htmlFor="New Password" className={styles.label}>
                    <span className={styles.inputLabel}>{t('new_password')}</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('enter_your_password')}
                      onChange={formik.handleChange('new_password')}
                      className={styles.input}
                      disabled={!isPassword}
                    />
                    {formik.errors.new_password && <p className={styles.formError}>{formik.errors.new_password}</p>}
                    <div className={styles.eye} onClick={() => setShowPassword(!showPassword)}>
                      <Icon path={showPassword ? mdiEyeOff : mdiEye} size={0.9} />
                    </div>
                  </label>
                  <label htmlFor="Repeat password" className={styles.label}>
                    <span className={styles.inputLabel}>{t('repeat_new_password')}</span>
                    <input
                      type={showPasswordRepeat ? 'text' : 'password'}
                      placeholder={t('enter_your_password')}
                      onChange={formik.handleChange('new_password_again')}
                      className={styles.input}
                      disabled={!isPassword}
                    />
                    {formik.errors.new_password_again && (
                      <p className={styles.formError}>{formik.errors.new_password_again}</p>
                    )}
                    <div className={styles.eye} onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}>
                      <Icon path={showPasswordRepeat ? mdiEyeOff : mdiEye} size={0.9} />
                    </div>
                  </label>
                </div>

                <Button
                  width="fit-content"
                  fontSize="0.9rem"
                  style="purple"
                  padding="0.5rem 1.2rem"
                  onClick={openModal}
                  disabled={!formik.dirty || formik.isSubmitting || !formik.isValid}
                >
                  {formik.isSubmitting ? <div className="dot-flashing" /> : t('save').toUpperCase()}
                </Button>

                {isModalOpened && (
                  <ConfirmationModal
                    message={t('sure_change_pass')}
                    onConfirm={() => {
                      formik.handleSubmit();
                      closeModal();
                    }}
                    onClose={closeModal}
                  />
                )}
              </div>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
