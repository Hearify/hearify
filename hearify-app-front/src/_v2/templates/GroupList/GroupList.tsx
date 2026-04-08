import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';

import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import GroupCard from '@v2/containers/GroupCard/GroupCard';
import AppButton from '@v2/components/AppButton/AppButton';
import AppPlaceholder from '@v2/components/AppPlaceholder/AppPlaceholder';
import CreateGroupModal from '@v2/templates/GroupList/CreateGroupModal/CreateGroupModal';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import useDeviceDetect from '@v2/hooks/useDeviceDetect';
import { errorToast } from '@src/toasts/toasts';
import { useAuthStore } from '@src/store/auth';
import styles from './GroupList.module.scss';

import type { Group } from '@v2/types/group';

const GroupList: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.GroupList' });

  const user = useAuthStore((state) => state.user);

  const { isDeviceLarge } = useDeviceDetect('sm');

  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadGroups = (): void => {
    GroupAPI.getAllGroups()
      .then((response) => setGroups(response.groups))
      .catch(() => errorToast(t('error')))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadGroups, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <main className={styles.wrapper}>
      <CreateGroupModal //
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        {isDeviceLarge && (
          <AppButton //
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            {t('button')}
          </AppButton>
        )}
      </div>

      {groups.length > 0 ? (
        <ul className={styles.list}>
          {groups.map((item) => (
            <GroupCard group={item} />
          ))}
        </ul>
      ) : (
        <AppPlaceholder icon={<UserGroupIcon />} text={t('placeholder-text')}>
          <AppButton //
            variant="secondary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            <SparklesIcon />
            {t('placeholder-button')}
          </AppButton>
        </AppPlaceholder>
      )}

      {!isDeviceLarge && (
        <AppButton //
          block
          size="lg"
          onClick={() => setIsModalOpen(true)}
        >
          {t('button')}
        </AppButton>
      )}
    </main>
  );
};

export default GroupList;
