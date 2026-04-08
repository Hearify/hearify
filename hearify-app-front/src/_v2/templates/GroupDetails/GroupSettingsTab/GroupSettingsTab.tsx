import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

import AppInput from '@v2/components/AppInput/AppInput';
import AppButton from '@v2/components/AppButton/AppButton';
import ConfirmationModal from '@v2/containers/ConfirmationModal/ConfirmationModal';
import { errorToast, successToast } from '@src/toasts/toasts';
import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import styles from './GroupSettingsTab.module.scss';

type GroupSettingsTabProps = {
  groupId: string;
  groupName: string;
};

const GroupSettingsTab: React.FC<GroupSettingsTabProps> = ({ groupId, groupName }) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.GroupSettingsTab' });

  const navigate = useNavigate();

  const [newName, setNewName] = useState<string>(groupName);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const deleteGroup = (): void => {
    GroupAPI.deleteGroup(groupId)
      .then(() => {
        navigate(`/groups`);
        successToast(t('success-delete'));
      })
      .catch(() => errorToast(t('error-delete')));
  };

  const changeGroupName = (): void => {
    newName.length === 0
      ? errorToast(t('error-length'))
      : GroupAPI.changeGroupName(groupId, newName)
          .then(() => {
            navigate(`/groups`);
            successToast(t('success-change'));
          })
          .catch(() => errorToast(t('error-change')));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewName(e.target.value);
  };

  const handlerModal = (): void => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <section className={styles.wrapper}>
      <ConfirmationModal //
        visible={isModalOpen}
        message={`${t('you-shure')}${groupName}`}
        onClose={handlerModal}
        onConfirm={deleteGroup}
      />

      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('group-info')}</h3>
          <AppButton //
            onClick={handlerModal}
            variant="secondary"
            iconButton
          >
            <TrashIcon />
          </AppButton>
        </div>
        <form className={styles.form}>
          <AppInput //
            value={newName}
            label={t('label')}
            onChange={handleNameChange}
            placeholder={groupName}
          />
        </form>
        <div className={styles.footer}>
          <AppButton variant="secondary">{t('change-owner')}</AppButton>
          <AppButton onClick={changeGroupName}>{t('save-changes')}</AppButton>
        </div>
      </div>
    </section>
  );
};

export default GroupSettingsTab;
