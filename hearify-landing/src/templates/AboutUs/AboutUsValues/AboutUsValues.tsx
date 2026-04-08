import React from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

import StarIcon from '@/assets/icons/star.svg';
import StarOutlineIcon from '@/assets/icons/star-outlined.svg';
import ValuesImg from '@/assets/images/about-us/our-values.png';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import AppDropdown from '@/components/AppDropdown/AppDropdown';
import styles from './AboutUsValues.module.scss';

type DataType = {
  title: string;
  description: string;
};

const AboutUsValues: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.AboutUsValues' });
  const data = t('data', { returnObjects: true });

  const { isDeviceLarge } = useDeviceDetect('lg');

  return (
    <section className={styles.wrapper} id="values">
      <h2 className={styles.title}>{t('title')}</h2>
      <div className={styles.container}>
        {isDeviceLarge ? (
          <ul className={styles.list}>
            {(data as DataType[]).map(item => (
              <li key={item.title} className={styles.item}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={styles.list}>
            {(data as DataType[]).map(item => (
              <AppDropdown key={item.title} title={item.title} content={item.description} />
            ))}
          </ul>
        )}
        <Image src={ValuesImg} alt="employees" className={styles.image} height={590} width={600} />
        <StarIcon className={styles.star1} />
        <StarOutlineIcon className={styles.star2} />
      </div>
    </section>
  );
};

export default AboutUsValues;
