import styles from '@src/pages/Results/LeaderBoard/LeaderBoard.module.scss';
import firstPlaceIcon from '@src/assets/images/first_place.svg';
import secondPlaceIcon from '@src/assets/images/second_place.svg';
import thirdPlaceIcon from '@src/assets/images/third_place.svg';
import ResultsBar from '../ProgressBar/ResultsBar';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit.tsx';
import type { FC } from 'react';

interface ItemProps {
  index: number;
  percentage: number;
  first_name: string;
  avatar: string;
  brandKit?: BrandKitInterface;
}
const Item: FC<ItemProps> = ({ index, percentage, first_name, avatar, brandKit }) => {
  const getIndex = () => {
    switch (index) {
      case 0:
        return <img src={firstPlaceIcon} />;
      case 1:
        return <img src={secondPlaceIcon} />;
      case 2:
        return <img src={thirdPlaceIcon} />;
      default:
        return <p className={styles.index}>{index + 1}</p>;
    }
  };

  return (
    <div className={styles.item}>
      <div className={styles.itemLeftPart}>
        {getIndex()}
        <div dangerouslySetInnerHTML={{ __html: avatar }} className={styles.avatar} />
        <p className={styles.username} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
          {first_name}
        </p>
      </div>
      <div className={styles.itemRightPart}>
        <ResultsBar percentage={percentage} width="370px" color={brandKit?.buttonFill} />
        <p className={styles.percentage} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
          {percentage}%
        </p>
      </div>
    </div>
  );
};

export default Item;
