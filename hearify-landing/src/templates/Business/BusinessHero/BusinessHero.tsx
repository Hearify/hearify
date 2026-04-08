import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { CalendarIcon } from '@heroicons/react/24/solid';

import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import heroImage from '@/assets/images/big-team-working.png';
import styles from './BusinessHero.module.scss';

import type { AnimationItem } from 'lottie-web';

const BusinessHero: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.BusinessHomeHero' });
  const animationRef = useRef<HTMLDivElement>(null);
  const lottieInstance = useRef<AnimationItem>();

  const loadLottie = async () => {
    const lottie = (await import('lottie-web')).default;

    if (animationRef.current && !lottieInstance.current) {
      lottieInstance.current = lottie.loadAnimation({
        container: animationRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: '/animations/animation.json',
      });

      lottieInstance.current.play();
    }

    return () => {
      lottieInstance.current?.destroy();
    };
  };

  useEffect(() => {
    loadLottie();

    return () => {
      lottieInstance.current?.destroy();
    };
  }, []);

  return (
    <section className={styles.wrapper} id="hero">
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.description}>{t('description')}</p>
      <AppButtonLink className={styles.button} href="https://app.hearify.org/signup" size="lg">
        {t('button')}
        <CalendarIcon />
      </AppButtonLink>
      <div>
        <Image
          className={styles.img}
          src={heroImage}
          alt="Team working"
          width={590}
          height={360}
          fetchPriority="high"
          priority
        />
        <div ref={animationRef} className={styles.animation} />
      </div>
    </section>
  );
};

export default BusinessHero;
