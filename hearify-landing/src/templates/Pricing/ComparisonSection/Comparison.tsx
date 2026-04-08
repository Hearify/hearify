import React from 'react';
import { useTranslation } from 'next-i18next';

import styles from './Comparison.module.scss';
import AnnualToggle from '@/assets/icons/annual-toggle.svg';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import PricingTable from '@/templates/Pricing/ComparisonSection/PricingTable/PricingTable';

const Comparison: React.FC = () => {
  const { t } = useTranslation('common');

  const { isDeviceSmall } = useDeviceDetect('sm');

  return (
    <div className={styles.wrapper}>
      <div className={styles['top-section']}>
        <div className={styles['title-container']}>
          <p className={styles.title}>{t('templates.comparison.title')}</p>
          <div className={styles['annual-savings-container']}>
            <div className={styles['btn-container']}>
              <p>{t('templates.comparison.billedAnnually')}</p>
              <AnnualToggle />
            </div>
            {!isDeviceSmall && <p className={styles['savings-text']}>{t('templates.comparison.saveUpTo33')}</p>}
          </div>
        </div>
      </div>
      <PricingTable />
    </div>
  );
};

export default Comparison;
