import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import QuizDropdownMemberItem from '../QuizDropdownMemberItem/QuizDropdownMemberItem';
import AppModal from '@v2/components/AppModal/AppModal';
import AppInput from '@v2/components/AppInput/AppInput';
import { errorToast, successToast } from '@src/toasts/toasts';
import { useAuthStore } from '@src/store/auth';
import styles from './QuizDropdownMemberModal.module.scss';
import AppButton from '@v2/components/AppButton/AppButton';

import type { Member } from '@v2/types/user';

export type QuizDropdownMemberModalProps = {
  visible: boolean;
  classCode: string;
  onClose: () => void;
};

const QuizDropdownMemberModal: React.FC<QuizDropdownMemberModalProps> = ({
  visible, //
  classCode,
  onClose,
}) => {
  const { t } = useTranslation('general');

  const { user } = useAuthStore((state) => state);

  const [members, setMembers] = useState<Member[]>([{ user: user!, role: 'owner' }]);

  const [email, setEmail] = useState<string>('');

  const loadMembers = () => {
    QuizAPI.getQuizMembers(classCode)
      .then((data) => setMembers([...data]))
      .catch((err) => console.error('Error fetching members: ', err));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleMemberDelete = (id: number): void => {
    setMembers((prev) => prev.filter((member) => member.user.id !== id));
  };

  const handleInviteButtonClick = (): void => {
    QuizAPI.inviteMember(classCode, email)
      .then(() => {
        loadMembers();
        successToast(t('add_member_success'));
      })
      .catch(() => {
        errorToast(t('add_member_error'));
      });
  };

  useEffect(loadMembers, [classCode]);

  return (
    <AppModal visible={visible} onClose={onClose} width="600px">
      <div className={styles.wrapper}>
        <div className={styles.actions}>
          <AppInput placeholder="Email" value={email} onChange={handleChange} />

          <AppButton onClick={handleInviteButtonClick} width="120px">
            {t('invite').toUpperCase()}
          </AppButton>
        </div>

        <h4 className={styles.title}>{t('team_members')}</h4>

        <div className={styles.list}>
          {members.map((member) => (
            <QuizDropdownMemberItem
              key={member.user.id}
              member={member}
              classCode={classCode}
              onMemberDelete={handleMemberDelete}
            />
          ))}
        </div>
      </div>
    </AppModal>
  );
};

export default QuizDropdownMemberModal;
