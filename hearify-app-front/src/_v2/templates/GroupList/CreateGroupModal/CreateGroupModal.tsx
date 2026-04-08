import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import AppInput from '@v2/components/AppInput/AppInput';
import AppButton from '@v2/components/AppButton/AppButton';
import AppModal from '@v2/components/AppModal/AppModal';
import { errorToast, successToast } from '@src/toasts/toasts';
import styles from './CreateGroupModal.module.scss';

type CreateGroupModalProps = {
  visible: boolean;
  onClose: () => void;
};

//TODO: MAX remake to react-hook-form
const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.CreateGroupModal' });

  const navigate = useNavigate();

  const [groupName, setGroupName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { handleSubmit, control } = useForm();

  const handleCreateGroup = (): void => {
    setIsLoading(true);

    GroupAPI.createGroup(groupName)
      .then((response) => {
        navigate(`/groups/${response.group_id}`);
        successToast(t('group-was-successfully-created'));
      })
      .catch(() => errorToast(t('request-error')))
      .finally(() => setIsLoading(false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setGroupName(e.target.value);
  };

  return (
    <AppModal visible={visible} onClose={onClose} width="500px">
      <div className={styles.wrapper}>
        <h3 className={styles.title}>{t('title')}</h3>

        <AppInput //
          placeholder={t('name-placeholder')}
          label={t('name')}
          value={groupName}
          onChange={handleChange}
        />

        <AppButton size="lg" block loading={isLoading} onClick={handleCreateGroup}>
          {t('button')}
        </AppButton>
      </div>
    </AppModal>
  );
};

export default CreateGroupModal;
