import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './DidntReceiveEmail.module.scss';

const DidntReceiveEmail = () => {
  const { t } = useTranslation('general');

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the timer if the component unmounts before 5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div>
      <div className={styles.wrapper}>{t('didnt_receive_email')} </div>
    </div>
  );
};

export default DidntReceiveEmail;
