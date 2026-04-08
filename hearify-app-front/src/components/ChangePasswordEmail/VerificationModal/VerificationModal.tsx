import { useTranslation } from 'react-i18next';

import DidntReceiveEmail from '@src/components/ChangePasswordEmail/DidntReceiveEmail/DidntReceiveEmail';
import styles from './VerificationModal.module.scss';
import arrow_left from '../../../assets/images/arrow-left.svg';

interface VerificationModalProps {
  email: string;
  sendResetEmail: () => void;
  handleBackClick: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  email,
  sendResetEmail,
  handleBackClick,
}: VerificationModalProps) => {
  const { t } = useTranslation('general');

  return (
    <div className={styles.module_wrapper}>
      <div className={styles.modal}>
        <div className={styles.navigation}>
          <div className={styles.back}>
            <button type="button" onClick={handleBackClick}>
              <img src={arrow_left} alt="Left arrow" />
              {t('back')}
            </button>
          </div>
          <button type="button" className={styles.resend} onClick={sendResetEmail}>
            {t('resend_link')}
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.title}>{t('check_email')}</div>
          <div className={styles.info}>
            {t('email_info')} {email}
          </div>
        </div>

        <div className={styles.email_nav}>
          <div className={styles.email_btn}>
            <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
              {t('open_email')}
            </a>
          </div>
          <DidntReceiveEmail />
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
