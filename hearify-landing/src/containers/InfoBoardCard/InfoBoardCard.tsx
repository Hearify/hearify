import React from 'react';

import styles from './InfoBoardCard.module.scss';

type AppContentItemProps = {
  text: string;
  image: React.FC<React.SVGProps<SVGSVGElement>>;
};

const BusinessInfoBoardCard: React.FC<AppContentItemProps> = ({ text, image: ImageComponent }) => {
  return (
    <div className={styles.contentItem}>
      <ImageComponent className={styles.image} />
      <p className={styles.itemText}>{text}</p>
    </div>
  );
};

export default BusinessInfoBoardCard;
