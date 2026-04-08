import React, { useState } from 'react';

import styles from '@/templates/Pricing/Plans/DesktopPlans.module.scss';
import PremiumPlan from '@/templates/Pricing/Plans/PremiumPlan';
import MaxPlan from '@/templates/Pricing/Plans/MaxPlan';
import CustomPlan from '@/templates/Pricing/Plans/CustomPlan';
import FreePlan from '@/templates/Pricing/Plans/FreePlan';
import useDeviceDetect from '@/hooks/useDeviceDetect';

const TabletPlans: React.FC = () => {
  const [activePlan, setActivePlan] = useState<string>('Premium');
  const { isDeviceSmall } = useDeviceDetect('sm');

  const switchPlan = (planName: string) => {
    setActivePlan(planName);
  };

  return (
    <div className={styles['plans-container']}>
      <div className={styles.options}>
        <button
          type="button"
          className={`${styles['plan-btn']} ${activePlan === 'Premium' && styles.active}`}
          onClick={() => switchPlan('Premium')}
        >
          {isDeviceSmall ? 'Premium' : 'Premium Plan'}
        </button>
        <button
          type="button"
          className={`${styles['plan-btn']} ${activePlan === 'Max' && styles.active}`}
          onClick={() => switchPlan('Max')}
        >
          {isDeviceSmall ? 'Max' : 'Max Plan'}
        </button>
        <button
          type="button"
          className={`${styles['plan-btn']} ${activePlan === 'Custom' && styles.active}`}
          onClick={() => switchPlan('Custom')}
        >
          {isDeviceSmall ? 'Custom' : 'Custom Plan'}
        </button>
        <button
          type="button"
          className={`${styles['plan-btn']} ${activePlan === 'Free' && styles.active}`}
          onClick={() => switchPlan('Free')}
        >
          {isDeviceSmall ? 'Free' : 'Free Plan'}
        </button>
      </div>
      <div className={styles['premium-max-plans-container']}>
        {activePlan === 'Premium' && <PremiumPlan />}
        {activePlan === 'Max' && <MaxPlan />}

        {activePlan === 'Custom' && (
          <div className={styles['custom-plan-container']}>
            <CustomPlan />
          </div>
        )}
        {activePlan === 'Free' && <FreePlan />}
      </div>
    </div>
  );
};

export default TabletPlans;
