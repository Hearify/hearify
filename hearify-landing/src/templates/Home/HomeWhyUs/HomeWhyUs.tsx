import React from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

import AppHeading from '@/components/AppHeading/AppHeading';
import whyUsImage from '@/assets/images/why-us.png';
import styles from './HomeWhyUs.module.scss';

type WhyUseBlock = {
  title: string;
  description: string;
};

const HomeWhyUs: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.HomeWhyUs' });

  const reasonsBlock: WhyUseBlock[] = t('blocks', { returnObjects: true });

  return (
    <section className={styles.wrapper} id="why-choose-our-quiz">
      <AppHeading variant="h2" className={styles.title}>
        {t('title')}
      </AppHeading>
      <p className={styles.description}>{t('description')}</p>

      <div className={styles.container}>
        <div className={styles.body}>
          {reasonsBlock.map(item => (
            <div key={item.title} className={styles.block}>
              <h4 className={styles.subtitle}>{item.title}</h4>
              <p className={styles.text}>{item.description}</p>
            </div>
          ))}
        </div>

        <Image src={whyUsImage} alt="Why choose our AI generator" width={590} height={610} className={styles.image} />
      </div>
    </section>
  );
};

export default HomeWhyUs;
