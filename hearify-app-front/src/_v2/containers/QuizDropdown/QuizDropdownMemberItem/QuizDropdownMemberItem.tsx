import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserIcon } from '@heroicons/react/24/outline';

import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import AppSelect, { type AppSelectOption } from '@v2/components/AppSelect/AppSelect';
import ConfirmationModal from '@v2/containers/ConfirmationModal/ConfirmationModal';
import { errorToast, successToast } from '@src/toasts/toasts';
import styles from './QuizDropdownMemberItem.module.scss';

import type { Member, UserQuizRole } from '@v2/types/user';

type QuizDropdownMemberItemProps = {
  member: Member;
  classCode: string;
  onMemberDelete: (id: number) => void;
};

const QuizDropdownMemberItem: React.FC<QuizDropdownMemberItemProps> = ({
  member, //
  classCode,
  onMemberDelete,
}) => {
  const { t } = useTranslation('general');

  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState<boolean>(false);

  const [newRole, setNewRole] = useState<UserQuizRole>(member.role);

  const roleOptions: AppSelectOption[] = [
    { id: 'owner', title: t('owner') },
    { id: 'admin', title: t('admin') },
    { id: 'member', title: t('member') },
  ];

  const deleteMember = (): void => {
    QuizAPI.deleteMember(classCode, member.user.id)
      .then(() => {
        successToast(t('delete_member_success'));
        onMemberDelete(member.user.id);
      })
      .catch(() => errorToast(t('delete_member_error')));
  };

  const changeMembersRole = (): void => {
    if (newRole === member.role) return;

    QuizAPI.changeMemberRole(classCode, member.user.id, newRole)
      .then(() => successToast(t('change_member_success')))
      .catch(() => errorToast(t('change_member_error')));
  };

  useEffect(changeMembersRole, [newRole]);

  return (
    <div className={styles.wrapper}>
      <ConfirmationModal
        visible={isDeleteModalOpened}
        onClose={() => setIsDeleteModalOpened(false)}
        message={t('sure_delete_member')}
        onConfirm={() => deleteMember()}
      />

      <p className={styles.name}>
        <UserIcon />
        {member.user.first_name} {member.user.surname}
      </p>

      <AppSelect //
        value="owner"
        options={roleOptions}
        onSelect={setNewRole}
      />
    </div>
  );
};

export default QuizDropdownMemberItem;
