import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import styles from '@src/pages/Settings/Settings.module.scss';
import { successToast, errorToast } from '@src/toasts/toasts';
import { useAuthStore } from '@src/store/auth';
import axios from '@src/api/axios';
import Button from '@src/components/Button/Button';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import useOnboarding from '@v2/hooks/useOnboarding';

import type { UserUpdateInfo } from '@src/interfaces/UserUpdateInfo';

const UserInformation = () => {
  const { t } = useTranslation('general');
  const { isModalOpened, openModal, closeModal } = useConfirmationModal();
  const user = useAuthStore((state) => state.user);

  const handleSubmit = async (
    values: { first_name: string; surname: string },
    { setSubmitting, resetForm }: { setSubmitting: any; resetForm: any }
  ) => {
    const updatingUserData: UserUpdateInfo = {};

    if (user?.first_name !== values.first_name) {
      updatingUserData.first_name = values.first_name;
    }

    if (user?.surname !== values.surname) {
      updatingUserData.surname = values.surname;
    }

    if (Object.keys(updatingUserData).length === 0) {
      openModal();
      return;
    }

    try {
      const patchResponse = await axios.patch('/api/users/me', updatingUserData);
      setSubmitting(false);

      const updatedUser = patchResponse.data;
      console.log('userResponse:', updatedUser);

      const token = localStorage.getItem('@token');
      const authStore = useAuthStore.getState();
      successToast(t('updated_user_information'));
      if (token) {
        authStore.login(token, updatedUser);
      }

      resetForm({
        values: {
          first_name: updatedUser.first_name,
          surname: updatedUser.surname,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      console.error('Error:', error);
      errorToast(t('failed_user_information'));
    }
  };

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required('First name cannot be an empty string'),
    surname: Yup.string().required('Surname cannot be an empty string'),
    email: Yup.string().email('Invalid email address').required('Email cannot be an empty string'),
  });

  useOnboarding('settings');

  return (
    <div className={`${styles.userInfo} ${styles.background}`} id="user-information-block">
      <div className={styles.userInfoInner}>
        <h3 className={styles.userInfoTitle}>{t('user_information')}</h3>
        <div className={styles.inputsContainer}>
          {/* <img src={avatarPath} alt="Your Avatar Image" className={styles.avatarImage} /> */}
          <Formik
            initialValues={{
              first_name: user?.first_name || '',
              surname: user?.surname || '',
              email: user?.email || '',
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            {(formik) => (
              <div className={styles.inputsWrapper}>
                <div className={styles.userInfoContainer}>
                  <label htmlFor="email" className={`${styles.label} ${styles.labelUserEmail}`}>
                    <span className={styles.inputLabel}>{t('email')}</span>
                    <input
                      disabled
                      type="email"
                      placeholder={formik.values.email}
                      onChange={formik.handleChange('email')}
                      className={styles.input}
                    />
                    {formik.errors.email && <p className={styles.formError}>{formik.errors.email}</p>}
                  </label>
                  <label htmlFor="First Name" className={`${styles.label} ${styles.labelUser}`}>
                    <span className={styles.inputLabel}>{t('first_name')}</span>
                    <input
                      type="text"
                      placeholder={formik.values.first_name}
                      onChange={formik.handleChange('first_name')}
                      className={styles.input}
                    />
                    {formik.errors.first_name && <p className={styles.formError}>{formik.errors.first_name}</p>}
                  </label>
                  <label htmlFor="Last Name" className={`${styles.label} ${styles.labelUser}`}>
                    <span className={styles.inputLabel}>{t('surname')}</span>
                    <input
                      type="text"
                      placeholder={formik.values.surname}
                      onChange={formik.handleChange('surname')}
                      className={styles.input}
                    />
                    {formik.errors.surname && <p className={styles.formError}>{formik.errors.surname}</p>}
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
                    message={t('sure_change_surname')}
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

export default UserInformation;
