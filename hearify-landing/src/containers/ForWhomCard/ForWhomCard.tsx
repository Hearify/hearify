import React from 'react';
import Link from 'next/link';

import styles from './ForWhomCard.module.scss';

export type ForWhomCardProps = {
  title: string;
  description: string;
  image: React.FC<React.SVGProps<SVGSVGElement>>;
  link?: string;
};

const ForWhomCard: React.FC<ForWhomCardProps> = ({
  title,
  description,
  image: ImageComponent,
  link = 'https://app.hearify.org/signup',
}) => {
  return (
    <Link href={link} className={styles.wrapper}>
      <div className={styles.imageWrapper}>
        <ImageComponent className={styles.image} width={56} height={56} color="#AC9AFF" />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </Link>
  );
};

export default ForWhomCard;
