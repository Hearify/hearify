import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import styles from '@src/pages/Settings/Settings.module.scss';
import axios from '@src/api/axios';

const Privacy = () => {
  const { t } = useTranslation('general');
  const [selectedMarketingCheckbox, setSelectedMarketingCheckbox] = useState(false);

  useEffect(() => {
    const storedValue = localStorage.getItem('enable_mailing');
    setSelectedMarketingCheckbox(storedValue === 'true');
  }, []);

  const handleMarketingCheckboxChange = async () => {
    const newSelectedMarketingCheckboxState = !selectedMarketingCheckbox;
    setSelectedMarketingCheckbox(newSelectedMarketingCheckboxState);
    localStorage.setItem('enable_mailing', newSelectedMarketingCheckboxState.toString());

    try {
      await axios.patch('/api/users/me', { enable_mailing: newSelectedMarketingCheckboxState });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`${styles.privacy} ${styles.background}`}>
      <div className={styles.innerSpace}>
        <h1 className={styles.userInfoTitle}>{t('privacy')}</h1>
        <label htmlFor="Read Privacy" className={styles.checkboxLabel}>
          <div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_7473_9197)">
                <rect width="20" height="20" rx="4" fill="#94A3B8" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0611 5.42238C15.5183 5.73229 15.6376 6.35411 15.3277 6.81124L10.2432 14.3112C10.0771 14.5562 9.8111 14.715 9.51671 14.745C9.22232 14.7749 8.92977 14.673 8.71777 14.4665L4.80234 10.6536C4.40667 10.2683 4.39827 9.6352 4.78358 9.23953C5.16888 8.84386 5.80199 8.83546 6.19766 9.22077L9.25771 12.2007L13.6723 5.68895C13.9822 5.23182 14.604 5.11247 15.0611 5.42238Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_7473_9197">
                  <rect width="20" height="20" rx="4" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <p>
            {t('read_agree_terms')}{' '}
            <a href="https://terms-of-service.hearify.org" className={styles.text}>
              {t('terms_of_use')}
            </a>{' '}
            {t('and')}{' '}
            <a href="https://privacy-policy.hearify.org" className={styles.text}>
              {t('privacy_policy_2')}
            </a>{' '}
            {t('read_agree_privacy')}
          </p>
        </label>
        <label
          htmlFor="Marketing Messages"
          className={`${styles.checkboxLabel} ${styles.checkboxLabelSelectable}`}
          onClick={handleMarketingCheckboxChange}
        >
          <div>
            {selectedMarketingCheckbox ? (
              <div>
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_7471_10843)">
                    <rect y="0.5" width="20" height="20" rx="4" fill="#6444F4" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.0611 5.92238C15.5183 6.23229 15.6376 6.85411 15.3277 7.31124L10.2432 14.8112C10.0771 15.0562 9.8111 15.215 9.51671 15.245C9.22232 15.2749 8.92977 15.173 8.71777 14.9665L4.80234 11.1536C4.40667 10.7683 4.39827 10.1352 4.78358 9.73953C5.16888 9.34386 5.80199 9.33546 6.19766 9.72077L9.25771 12.7007L13.6723 6.18895C13.9822 5.73182 14.604 5.61247 15.0611 5.92238Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_7471_10843">
                      <rect y="0.5" width="20" height="20" rx="4" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            ) : (
              <div>
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="1" width="19" height="19" rx="3.5" stroke="#64748B" />
                </svg>
              </div>
            )}
          </div>
          <p>{t('receive_marketing_messages')}</p>
        </label>
      </div>
    </div>
  );
};

export default Privacy;
