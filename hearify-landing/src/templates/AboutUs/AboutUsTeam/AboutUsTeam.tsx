import React from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

import AboutUs1 from '@/assets/images/about-us/about-us-1.png';
import AboutUs2 from '@/assets/images/about-us/about-us-2.png';
import AboutUs3 from '@/assets/images/about-us/about-us-4.png';
import LinkedinIcon from '@/assets/icons/linkedin.svg';
import styles from './AboutUsTeam.module.scss';

type DataType = {
  title: string;
  text: string;
  description: string;
  link: string;
};

const AboutUsTeam: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.AboutUsTeam' });

  const data = t('data', { returnObjects: true });
  return (
    <section className={styles.wrapper} id="team">
      <h2 className={styles.title}>{t('title')}</h2>
      <p className={styles.description}>{t('description')}</p>
      <ul className={styles.list}>
        {(data as DataType[]).map((item, index) => (
          <li key={item.title} className={styles.item}>
            <div className={styles.content}>
              <a href={item.link} target="_blank" className={styles.image}>
                {index === 0 && <Image alt="Person" src={AboutUs1} width={100} height={100} />}
                {index === 1 && <Image alt="Person" src={AboutUs2} width={100} height={100} />}
                {index === 2 && <Image alt="Person" src={AboutUs3} width={100} height={100} />}
                <LinkedinIcon />
              </a>
              <div>
                <h4 className={styles.itemTitle}>{item.title}</h4>
                <p className={styles.text}>{item.text}</p>
              </div>
            </div>
            <p className={styles.itemDescription}>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AboutUsTeam;
