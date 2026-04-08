import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';
import AuthAPI from '@v2/api/AuthAPI/AuthAPI';
import AppInput from '@src/_v2/components/AppInput/AppInput';
import AppButton from '@src/_v2/components/AppButton/AppButton';
import AppCheckbox from '@src/_v2/components/AppCheckbox/AppCheckbox';
import { errorToast } from '@src/toasts/toasts';
import { GoogleButton } from '@src/components/GoogleButton/GoogleButton';
import { useAuthStore } from '@src/store/auth';
import { trackSignUp } from '@src/util/analyticTracking.ts';
import styles from './SingUp.module.scss';
import { SignUpData } from '@src/_v2/api/AuthAPI/AuthAPI.types';

export type SignUpForm = {
  first_name: string;
  surname: string;
  email: string;
  password: string;
  enable_mailing: boolean;
  terms: boolean;
};

const SignUp: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.SignUp' });

  const navigate = useNavigate();
  const { login } = useAuthStore((state) => state);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpForm>();
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit: SubmitHandler<SignUpData> = (data) => {
    const { first_name, surname, email, password, enable_mailing } = data;

    AuthAPI.signUp({ first_name, surname, email, password, enable_mailing })
      .then(async (res) => {
        const { user, access_token: token } = res;

        TrackingAPI.userId = String(user.id);
        TrackingAPI.trackEvent('authorization', {
          status: 'sign_up',
          method: 'email',
        });

        await AuthAPI.sendVerificationEmail(String(user.id));

        trackSignUp();
        login(token, user);
        navigate('/generate-quiz');
      })
      .catch((err) => {
        const { detail } = err.response.data;
        errorToast(detail);
      })
      .finally(() => setSubmitting(false));
  };

  const handleSignInWithProvider = (provider: string): void => {
    AuthAPI.signInWithProvider(provider)
      .then((res) => window.location.replace(res.url))
      .catch((err) => console.log('Login with provider error: ', err));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>
        <div className={styles.brandTop}>
          <span className={styles.brandName}>Hearify</span>
        </div>
        <div className={styles.brandMiddle}>
          <h2 className={styles.brandHeadline}>Start your quiz journey today</h2>
          <p className={styles.brandSubline}>
            Join thousands of educators and teams who create engaging AI-powered quizzes with Hearify.
          </p>
        </div>
        <div className={styles.brandBottom}>
          <div className={styles.brandStat}>
            <strong>50k+</strong>
            <span>Quizzes created</span>
          </div>
          <div className={styles.brandStat}>
            <strong>120+</strong>
            <span>Countries</span>
          </div>
          <div className={styles.brandStat}>
            <strong>4.8★</strong>
            <span>User rating</span>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>Free forever. No credit card required.</p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.nameWrapper}>
              <Controller
                control={control}
                name="first_name"
                rules={{ required: { value: true, message: t('first-name-required') } }}
                render={({ field: { value, onChange } }) => (
                  <AppInput
                    error={errors.first_name?.message}
                    size="lg"
                    type="text"
                    placeholder={t('name-placeholder')}
                    value={value}
                    onChange={onChange}
                    label={t('name-label')}
                  />
                )}
              />
              <Controller
                control={control}
                name="surname"
                rules={{ required: { value: true, message: t('surname-required') } }}
                render={({ field: { value, onChange } }) => (
                  <AppInput
                    error={errors.surname?.message}
                    size="lg"
                    type="text"
                    placeholder={t('surname-placeholder')}
                    value={value}
                    onChange={onChange}
                    label={t('surname-label')}
                  />
                )}
              />
            </div>
            <Controller
              control={control}
              name="email"
              rules={{ required: { value: true, message: t('email-required') } }}
              render={({ field: { value, onChange } }) => (
                <AppInput
                  error={errors.email?.message}
                  size="lg"
                  type="text"
                  placeholder={t('email-placeholder')}
                  value={value}
                  onChange={onChange}
                  label={t('email-label')}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{ required: { value: true, message: t('password-required') } }}
              render={({ field: { value, onChange } }) => (
                <AppInput
                  error={errors.password?.message}
                  size="lg"
                  type="password"
                  placeholder={t('password-placeholder')}
                  value={value}
                  onChange={onChange}
                  label={t('password-label')}
                />
              )}
            />
            <div className={styles.checkboxes}>
              <Controller
                control={control}
                name="enable_mailing"
                defaultValue={false}
                render={({ field: { value, onChange } }) => (
                  <AppCheckbox
                    name="enable_mailing"
                    label={t('email-agreeement-checkbox')}
                    checked={value}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="terms"
                rules={{ required: { value: true, message: t('terms-privacy-checkbox-required') } }}
                render={({ field: { value, onChange } }) => (
                  <AppCheckbox
                    checked={value}
                    error={errors.terms?.message}
                    name="terms"
                    label={
                      <Trans i18nKey="read-agree-terms">
                        I have read and agree with the Hearify{' '}
                        <a className={styles.copyrightLink} href="https://hearify.org/terms-of-use">
                          Terms and Conditions
                        </a>
                        {' '}and{' '}
                        <a className={styles.copyrightLink} href="https://hearify.org/privacy-policy">
                          Privacy Policy
                        </a>
                      </Trans>
                    }
                    onChange={onChange}
                  />
                )}
              />
            </div>
            <div className={styles.buttons}>
              <AppButton type="submit" disabled={isSubmitting} loading={isSubmitting} size="lg" block>
                {t('sign-up-button')}
              </AppButton>
              <span className={styles.divider}>{t('divider')}</span>
              <GoogleButton text={t('sign-up-google-button')} onClick={() => handleSignInWithProvider('google')} />
            </div>
          </form>

          <p className={styles.signIn}>
            {t('already-have-account-button')}
            <Link className={styles.signInLink} to="/login">{t('back-to-login-button')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
