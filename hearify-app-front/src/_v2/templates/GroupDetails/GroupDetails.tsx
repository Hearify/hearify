import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UsersIcon, Cog6ToothIcon, DocumentTextIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import cn from 'classnames';

import GroupQuizzesTab from './GroupQuizzesTab/GroupQuizzesTab';
import GroupAddParticipantModal from './GroupAddParticipantModal/GroupAddParticipantModal';
import GroupParticipantsTab from './GroupParticipantsTab/GroupParticipantsTab';
import GroupStatisticsTab from './GroupStatisticsTab/GroupStatisticsTab';
import GroupSettingsTab from './GroupSettingsTab/GroupSettingsTab';
import GroupAddQuizModal from './GroupAddQuizModal/GroupAddQuizModal';
import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import AppButton from '@v2/components/AppButton/AppButton';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import useDeviceDetect from '@v2/hooks/useDeviceDetect';
import { errorToast, successToast } from '@src/toasts/toasts';
import styles from './GroupDetails.module.scss';

import { Group } from '@v2/types/group';
import { Quiz } from '@v2/types/quiz';

const GroupDetails: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.GroupDetails' });

  const { groupId, userId } = useParams<string>();

  const { isDeviceLarge } = useDeviceDetect('lg');

  const [groupData, setGroupData] = useState<Group>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState<string>('quizzes');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isMemberAccepted = useRef(false);

  const tabs = [
    { icon: DocumentTextIcon, key: 'quizzes', name: t('quizzes') },
    { icon: UsersIcon, key: 'participants', name: t('participants') },
    { icon: PresentationChartLineIcon, key: 'statistics', name: t('statistics') },
    { icon: Cog6ToothIcon, key: 'settings', name: t('settings') },
  ];

  const getGroup = (): void => {
    GroupAPI.getGroup(groupId)
      .then((response) => setGroupData(response.group))
      .catch(() => errorToast(t('error-group')));
  };

  console.log('KAKAKAKAKAK');
  console.log(groupData);

  const getGroupQuizzes = (): void => {
    GroupAPI.getGroupQuizzes(groupId)
      .then((response) => setQuizzes(response.quizzes))
      .catch(() => errorToast(t('error-quizzes')))
      .finally(() => setIsLoading(false));
  };

  const acceptMember = (): void => {
    GroupAPI.acceptMember(groupId, userId)
      .then(() => successToast('Wellcome to the Group'))
      .catch(() => errorToast('something goes wrong'));
  };

  const onNavigate = (tab: string): void => {
    setActiveTab(tab);
  };

  const handlerModal = (): void => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (groupId && userId && !isMemberAccepted.current) {
      acceptMember();
      isMemberAccepted.current = true;
    }
  }, [groupId, userId]);

  useEffect(getGroup, []);

  useEffect(getGroupQuizzes, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className={styles.wrapper}>
      <GroupAddQuizModal //
        groupId={groupId}
        visible={activeTab === 'quizzes' && isModalOpen}
        onClose={handlerModal}
      />

      <GroupAddParticipantModal //
        groupId={groupId}
        visible={activeTab === 'participants' && isModalOpen}
        onClose={handlerModal}
      />

      <h1 className={styles.title}>{groupData.name}</h1>
      <div className={styles.header}>
        <ul className={styles.list}>
          {tabs.map((tab) => (
            <li
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              className={cn(styles.tab, activeTab === tab.key && styles.tabActive)}
            >
              <tab.icon className={styles.tabIcon} />
              {tab.name}
            </li>
          ))}
        </ul>

        {isDeviceLarge && (
          <>
            {activeTab === 'quizzes' && (
              <AppButton size="lg" width="270px" onClick={handlerModal}>
                {t('add-quizzes')}
              </AppButton>
            )}
            {activeTab === 'participants' && (
              <AppButton size="lg" width="270px" onClick={handlerModal}>
                {t('invite')}
              </AppButton>
            )}
            {activeTab === 'statistics' && (
              <AppButton size="lg" width="270px" onClick={handlerModal}>
                {t('download-results')}
              </AppButton>
            )}
          </>
        )}
      </div>

      {activeTab === 'quizzes' && <GroupQuizzesTab groupId={groupId} quizzes={quizzes} />}
      {activeTab === 'participants' && <GroupParticipantsTab groupId={groupId} members={groupData.members} />}
      {activeTab === 'statistics' && <GroupStatisticsTab />}
      {activeTab === 'settings' && <GroupSettingsTab groupId={groupId} groupName={groupData.name} />}

      {!isDeviceLarge && (
        <>
          {activeTab === 'quizzes' && (
            <AppButton size="lg" block onClick={handlerModal}>
              {t('add-quizzes')}
            </AppButton>
          )}
          {activeTab === 'participants' && (
            <AppButton size="lg" block onClick={handlerModal}>
              {t('invite')}
            </AppButton>
          )}
          {activeTab === 'statistics' && (
            <AppButton size="lg" block onClick={handlerModal}>
              {t('download-results')}
            </AppButton>
          )}
        </>
      )}
    </div>
  );
};

export default GroupDetails;
