import React from 'react';

import styles from './BenefitsSection.module.scss';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import AppDropdown from '@/components/AppDropdown/AppDropdown';

type BenefitBlock = {
  title: string;
  description: string;
};

type BenefitProps = {
  title: string;
  description?: string;
  benefitBlocks: BenefitBlock[];
  icons: React.FC<React.SVGProps<SVGSVGElement>>[];
};

const BenefitsSection: React.FC<BenefitProps> = ({ title, description = '', benefitBlocks, icons }) => {
  const { isDeviceLarge } = useDeviceDetect('md');

  const renderIcon = (index: number) => {
    const Icon = icons[index];
    return Icon ? <Icon /> : null;
  };

  const renderList = () => (
    <ul className={styles.list}>
      {benefitBlocks.map((block, index) =>
        isDeviceLarge ? (
          <li key={block.title} className={styles.item}>
            <div className={styles.image}>{renderIcon(index)}</div>
            <div className={styles.content}>
              <h3 className={styles.subtitle}>{block.title}</h3>
              <p className={styles.text}>{block.description}</p>
            </div>
          </li>
        ) : (
          <AppDropdown
            key={block.title}
            icon={<div className={styles.image}>{renderIcon(index)}</div>}
            title={block.title}
            content={block.description}
          />
        ),
      )}
    </ul>
  );

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {renderList()}
    </section>
  );
};

export default BenefitsSection;
