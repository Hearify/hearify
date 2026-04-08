import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import { featuredByBlocks } from './HomeFeatured.data';
import styles from './HomeFeatured.module.scss';

/* eslint-disable react/no-array-index-key */
const HomeFeatured: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.HomeFeatured' });

  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.offsetWidth;
      sliderRef.current.style.setProperty('--total-width', `-${slideWidth}px`);
    }
  }, []);

  return (
    <section className={styles.wrapper} id="featured-by">
      <h2 className={styles.title}>{t('title')}</h2>
      <div className={styles.slider} ref={sliderRef}>
        {[...featuredByBlocks, ...featuredByBlocks].map((item, index) => (
          <div key={index} className={styles.slide}>
            <Image //
              src={item.imageUrl}
              alt={item.title}
              height={60}
              className={styles.image}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeFeatured;
