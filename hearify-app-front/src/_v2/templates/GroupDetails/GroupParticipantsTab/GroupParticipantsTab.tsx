import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/solid';

import AppSelect from '@v2/components/AppSelect/AppSelect';
import styles from './GroupParticipantsTab.module.scss';

import { members } from '@v2/types/group';
import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import { errorToast, successToast } from '@src/toasts/toasts';

type GroupParticipantsTabProps = {
  members: members[];
  groupId: string;
};

const GroupParticipantsTab: React.FC<GroupParticipantsTabProps> = ({ members, groupId }) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.GroupAddParticipantsTab' });

  //TODO: Max add role changer after alex fix
  const [selectedOption, setSelectedOption] = useState<string>('Owner');
  const options = [
    { id: 'Owner', title: t('owner') },
    { id: 'Admin', title: t('admin') },
    { id: 'Member', title: t('member') },
  ];

  console.log('HAHHAHAHHAHHAHAHA');
  console.log(members);

  // TODO: Max wait for alex when he fix delete memeber from quiz
  const removeMember = (userId: string): void => {
    GroupAPI.removeMember(groupId, userId)
      .then(() => successToast('gooood'))
      .catch(() => {
        console.log(userId, groupId);
        errorToast('bad');
      });
  };

  const handleSelectChange = (value: string): void => {
    setSelectedOption(value);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <p>{t('name')}</p>
        <p>{t('email')}</p>
        <p>{t('invitation-status')}</p>
        <p>{t('role')}</p>
        <p>{t('remove')}</p>
      </header>
      {members.map((item) => (
        <li className={styles.contentItem}>
          <p>{item.name}</p>
          <p>{item.email}</p>
          <p>{item.status}</p>
          <AppSelect //
            size="sm"
            value={item.role}
            options={options}
            onSelect={handleSelectChange}
          />
          <XMarkIcon onClick={() => removeMember(item._id)} />
        </li>
      ))}
    </div>
  );
};

export default GroupParticipantsTab;
