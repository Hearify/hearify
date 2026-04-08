import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import AppInput from '@v2/components/AppInput/AppInput';
import AppModal from '@v2/components/AppModal/AppModal';
import AppButton from '@v2/components/AppButton/AppButton';
import AppSelect, { AppSelectOption } from '@v2/components/AppSelect/AppSelect';
import { errorToast, successToast } from '@src/toasts/toasts';
import styles from './GroupAddParticipantModal.module.scss';

type GroupAddParticipantModalProps = {
  groupId: string;
  visible: boolean;
  onClose: () => void;
};

//TODO: MAX remake to react-hook-form
const GroupAddParticipants: React.FC<GroupAddParticipantModalProps> = ({ groupId, visible, onClose }) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.GroupAddParticipantsModal' });

  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('Member');

  const options: AppSelectOption[] = [
    { id: 'Member', title: t('member') },
    { id: 'Admin', title: t('admin') },
  ];

  const inviteMember = () => {
    GroupAPI.inviteMember(groupId, email, role)
      .then(() => successToast(t('success')))
      .catch(() => errorToast(t('error')));
  };

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleSelectRole = (value: string): void => {
    setRole(value);
  };

  return (
    <AppModal //
      visible={visible}
      onClose={onClose}
      width="500px"
    >
      <div className={styles.wrapper}>
        <h3 className={styles.title}>{t('invite')}</h3>
        <form action="" className={styles.form}>
          <AppInput //
            type="email"
            value={email}
            onChange={handleChangeEmail}
            label={t('email')}
            size="lg"
          />
          <AppSelect //
            value={role}
            options={options}
            onSelect={handleSelectRole}
            size="lg"
          />
        </form>
        <AppButton onClick={inviteMember} block size="lg">
          {t('invite-button')}
        </AppButton>
      </div>
    </AppModal>
  );
};

export default GroupAddParticipants;
