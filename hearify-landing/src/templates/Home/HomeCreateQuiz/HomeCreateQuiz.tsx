import React from 'react';
import { useTranslation } from 'next-i18next';

import AppHeading from '@/components/AppHeading/AppHeading';
import styles from './HomeCreateQuiz.module.scss';

const HomeCreateQuiz: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.HomeCreateQuiz' });

  return (
    <section className={styles.wrapper} id="create-quiz">
      <AppHeading variant="h2" className={styles.title}>
        {t('title')}
      </AppHeading>

      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        {/* <video src="/how_it_works.mp4" width="100%" controls /> */ }
        <iframe
          src="https://www.loom.com/embed/06e96bcd3b2e4a90b0a884e54d905d51"
          title="How it works video"
          allowFullScreen
          frameBorder="0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
        <p style={{ color: 'black' }}>
          This video provides a quick walkthrough of how to create a quiz using our platform, showcasing the intuitive interface, customizable question options, and seamless publishing process to help you get started effortlessly.
        </p>
      </div>
    </section>
  );
};

export default HomeCreateQuiz;
