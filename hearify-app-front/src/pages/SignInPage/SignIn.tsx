import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';
import AuthAPI from '@src/_v2/api/AuthAPI/AuthAPI';
import { useAuthStore } from '@src/store/auth';
import { errorToast, successToast } from '@src/toasts/toasts';
import { trackSignIn } from '@src/util/analyticTracking.ts';
import { emailRegex } from '@src/_v2/constants/regex';
import { GoogleButton } from '@src/components/GoogleButton/GoogleButton';
import AppInput from '@src/_v2/components/AppInput/AppInput';
import AppButton from '@src/_v2/components/AppButton/AppButton';
import styles from './SignIn.module.scss';

export type SignInForm = {
  email: string;
  password: string;
  setSubmitting: boolean;
};

const SignIn: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.SignIn' });
  const navigate = useNavigate();
  const { login } = useAuthStore((state) => state);
  const location = useLocation();
  const [isSubmitting, setSubmitting] = useState(false);

  const { handleSubmit, control } = useForm<SignInForm>();

  const googleFormSuccess = location.state?.googleFormSuccess;

  const onSubmit: SubmitHandler<SignInForm> = (data): void => {
    const { email, password } = data;
    setSubmitting(true);

    AuthAPI.login(email, password)
      .then((res) => {
        const { access_token: token, user } = res;

        TrackingAPI.userId = String(user.id);
        TrackingAPI.trackEvent('authorization', {
          status: 'login',
          method: 'email',
        });

        trackSignIn();
        login(token, user);
        navigate('/home');
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

  useEffect(() => {
    if (googleFormSuccess) {
      successToast(t('success-form-exported'));
    }
  }, [googleFormSuccess, location]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.brand}>
        <div className={styles.brandTop}>
          <span className={styles.brandName}>Hearify</span>
        </div>
        <div className={styles.brandMiddle}>
          <h2 className={styles.brandHeadline}>Quizzes that actually teach</h2>
          <p className={styles.brandSubline}>
            Create AI-powered quizzes, track progress, and engage your audience — all in one place.
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
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account to continue</p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: { value: true, message: t('email-required') },
                pattern: { value: emailRegex, message: t('email-pattern') },
              }}
              render={({ field: { value, onChange } }) => (
                <AppInput
                  size="lg"
                  type="text"
                  placeholder={t('enter-email')}
                  label={t('email')}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              rules={{
                required: { value: true, message: t('password-required') },
                min: { value: 8, message: t('password-min') },
              }}
              render={({ field: { value, onChange } }) => (
                <AppInput
                  size="lg"
                  type="password"
                  placeholder={t('enter-password')}
                  label={t('password')}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <Link className={styles.resetPassword} to="/change-password/email">
              {t('forgot-password')}
            </Link>
            <AppButton type="submit" disabled={isSubmitting} loading={isSubmitting} size="lg" block>
              {t('login-with-email')}
            </AppButton>
          </form>

          <span className={styles.divider}>{t('divider')}</span>
          <div className={styles.googleButtonWrapper}>
            <GoogleButton text={t('sign-in-with-google')} onClick={() => handleSignInWithProvider('google')} />
          </div>

          <p className={styles.copyright}>
            <Trans i18nKey="terms-of-use-and-privacy-policy">
              By signing in, you agree to our{' '}
              <a className={styles.copyrightLink} href="https://hearify.org/terms-of-use">Terms</a>
              {' '}and{' '}
              <a className={styles.copyrightLink} href="https://hearify.org/privacy-policy">Privacy Policy</a>
            </Trans>
          </p>
          <p className={styles.signUp}>
            {t('dont-have-account')}
            <Link className={styles.signUpLink} to="/signup">{t('sign-up')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
