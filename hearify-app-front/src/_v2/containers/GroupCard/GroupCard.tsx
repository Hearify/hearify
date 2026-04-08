import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@src/store/auth';
import styles from './GroupCard.module.scss';

import type { Group } from '@v2/types/group';

type GroupCardProps = {
  group: Group;
};

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { t } = useTranslation('general');

  const user = useAuthStore((state) => state.user);

  const isOwner = group.owner_id == user?.id.toString();

  return (
    <Link className={styles.wrapper} to={`/groups/${group._id}`}>
      <div className={styles.header}>
        <h5 className={styles.title}>{group.name}</h5>
      </div>
      <p className={styles.text}>
        {group.members?.length || 0} {t('students')}
      </p>
      <div className={styles.box}>
        <p className={styles.text}>
          {group.assigned_quizzes?.length || 0} {t('quests')}
        </p>
        <span className={styles.role}>{isOwner ? t('owner') : t('member')}</span>
      </div>
    </Link>
  );
};

export default GroupCard;
