import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import checkmark from '@src/assets/images/check-circle-bold.png';
import styles from './PasswordUpdated.module.scss';

const PasswordUpdatedModal = () => {
  const { t } = useTranslation('general');

  return (
    <div className={styles.module_wrapper}>
      <div className={styles.modal}>
        <div>
          <img src={checkmark} alt="Checkmark" />
        </div>
        <div className={styles.body}>
          <div className={styles.title}>{t('password_updated')}</div>
          <Link className={styles.confirm_btn} to="/login">
            OK
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdatedModal;
