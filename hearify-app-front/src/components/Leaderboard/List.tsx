import styles from '@src/pages/Results/LeaderBoard/LeaderBoard.module.scss';

import Item from '@src/components/Leaderboard/Item';

import type { User } from '@src/interfaces/User.ts';
import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit.tsx';

interface ListProps {
  students: User[];
  brandKit: BrandKitInterface;
}

const List = ({ students, brandKit }: ListProps) => {
  return (
    <div className={styles.list}>
      {students.map((student: any, index: number) => (
        <Item
          key={index}
          first_name={student.first_name}
          percentage={student.percentage}
          index={index}
          avatar={student.avatar}
          brandKit={brandKit}
        />
      ))}
    </div>
  );
};

export default List;
