import React from 'react';
import Image from 'next/image';
import Carousel from 'nuka-carousel';
import { useTranslation } from 'next-i18next';

import AppHeading from '@/components/AppHeading/AppHeading';
import reviewAuthor1 from '@/assets/images/reviews/review-author-1.png';
import reviewAuthor2 from '@/assets/images/reviews/review-author-2.png';
import reviewAuthor3 from '@/assets/images/reviews/review-author-3.png';
import reviewAuthor4 from '@/assets/images/reviews/review-author-4.png';
import styles from './HomeReviews.module.scss';

type ReviewBlock = {
  name: string;
  position: string;
  text: string;
};

// TODO(Sasha): Check everywehre for compoents to be sections
const HomeReviews: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.HomeReviews' });

  const reviewBlocks: ReviewBlock[] = t('reviews', { returnObjects: true });

  return (
    <section className={styles.wrapper} id="hearify-reviews">
      <AppHeading variant="h2" className={styles.title}>
        {t('title')}
      </AppHeading>

      <div className={styles.card}>
        <Carousel
          className={styles.carousel}
          renderCenterLeftControls={null}
          renderCenterRightControls={null}
          defaultControlsConfig={{
            // TODO(Sasha): Add arrows back (fix width overflow)
            containerClassName: styles.controls,
            pagingDotsClassName: styles.dots,
            // nextButtonText: <NextArrowIcon />,
            // nextButtonClassName: styles.arrow,
            // prevButtonText: <PrevArrowIcon />,
            // prevButtonClassName: styles.arrow,
          }}
          wrapAround
          autoplay
        >
          {reviewBlocks.map((item, index) => (
            <div className={styles.container} key={item.name}>
              <div className={styles.review}>
                <div className={styles.header}>
                  {index === 0 && (
                    <Image src={reviewAuthor1} alt={item.name} width={100} height={100} className={styles.image} />
                  )}
                  {index === 1 && (
                    <Image src={reviewAuthor2} alt={item.name} width={100} height={100} className={styles.image} />
                  )}
                  {index === 2 && (
                    <Image src={reviewAuthor3} alt={item.name} width={100} height={100} className={styles.image} />
                  )}
                  {index === 3 && (
                    <Image src={reviewAuthor4} alt={item.name} width={100} height={100} className={styles.image} />
                  )}

                  <div className={styles.body}>
                    <p className={styles.name}>{item.name}</p>
                    <p className={styles.position}>{item.position}</p>
                  </div>
                </div>

                <div className={styles.content}>{item.text}</div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default HomeReviews;
