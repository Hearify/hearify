import React from 'react';

import styles from '@/templates/Pricing/Plans/DesktopPlans.module.scss';
import PremiumPlan from '@/templates/Pricing/Plans/PremiumPlan';
import MaxPlan from '@/templates/Pricing/Plans/MaxPlan';
import CustomPlan from '@/templates/Pricing/Plans/CustomPlan';

const DesktopPlans: React.FC = () => {
  return (
    <div className={styles['plans-container']}>
      <div className={styles['premium-max-plans-container']}>
        <PremiumPlan />
        <MaxPlan />
      </div>
      <div className={styles['custom-plan-container']}>
        <CustomPlan />
      </div>
    </div>
  );
};

export default DesktopPlans;
