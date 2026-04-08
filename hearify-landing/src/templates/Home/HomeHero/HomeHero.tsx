import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import ArrowIcon from '@/assets/icons/chevron-right.svg';
import StarIcon from '@/assets/icons/star.svg';
import StarOutlineIcon from '@/assets/icons/star-outlined.svg';
import homeHeroImage from '@/assets/images/home-hero.png';
import avatarsImage from '@/assets/images/avatars.png';
import createQuizImage from '@/assets/images/create-your-quiz.png';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import styles from './HomeHero.module.scss';

const HomeHero: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.HomeHero' });

  const { isDeviceLarge } = useDeviceDetect('md');

  return (
    <section className={styles.wrapper} id="hero">
      <div className={styles.container}>
        <div className={styles.body}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.description}>{t('description')}</p>

          <AppButtonLink href="https://app.hearify.org/signup" size="lg" className={styles.button}>
            {t('button')}
            <ArrowIcon />
          </AppButtonLink>

          <Link href="/#hearify-reviews" className={styles.content}>
            <Image src={avatarsImage} className={styles.avatars} alt="avatars" width={76} height={32} />
            <p className={styles.hint}>{t('hint')}</p>
          </Link>
        </div>

        <Link href="https://app.hearify.org/signup">
          {isDeviceLarge ? (
            <>
              <Image
                src={homeHeroImage}
                className={styles.image}
                width={750}
                height={440}
                alt="Create your quiz"
                priority
              />
              <StarIcon className={styles.star1} />
              <StarOutlineIcon className={styles.star2} />
            </>
          ) : (
            <Image
              src={createQuizImage}
              className={styles.image}
              width={400}
              height={260}
              alt="Create your quiz"
              priority
            />
          )}
        </Link>
      </div>
    </section>
  );
};

export default HomeHero;
