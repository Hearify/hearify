import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import styles from '@src/components/AddMember/AddMemberModal.module.scss';
import member from '@src/assets/images/user.svg';
import arrowUp from '@src/assets/images/chevron-up.svg';
import arrowDown from '@src/assets/images/chevron-down.svg';
import ChooseRoleDropdown from '@src/components/AddMember/ChooseRoleDropdown.tsx';
import { errorToast, successToast } from '@src/toasts/toasts.tsx';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal.ts';
import ConfirmationModal from '@src/components/ConfirmationModal/ConfirmationModal.tsx';

import type { ChooseRoleDropdownProps } from '@src/components/AddMember/ChooseRoleDropdown.tsx';

interface MemberItemProps {
  userId: string;
  name: string;
  role: string;
  classCode: string;
  getMembers: () => void;
}

const MemberItem = ({ userId, name, role, classCode, getMembers }: MemberItemProps) => {
  const { t } = useTranslation('general');
  const deleteModal = useConfirmationModal();

  const chooseRoleRef = useRef<ChooseRoleDropdownProps>(null);
  const chooseRoleArrowRef = useRef(null);

  const [newRole, setNewRole] = useState(null);
  const [currentRole, setCurrentRole] = useState(role);

  const deleteMember = async () => {
    await axios
      .delete(`/api/quiz-members/${classCode}/${userId}/delete_member`)
      .then(({ data }) => {
        if (data.success) {
          successToast(t('delete_member_success'));
          getMembers();
          deleteModal.closeModal();
        }
      })
      .catch((err) => {
        const { detail } = err.response.data;
        errorToast(detail);
      });
  };

  const changeMembersRole = async () => {
    const changeData = { new_role: newRole, user_id: userId };

    axios
      .patch(`/api/quiz-members/${classCode}/change_member_role`, changeData)
      .then(({ data }) => {
        if (data.success) {
          successToast(t('change_member_success'));
        }
      })
      .catch((err) => {
        const { detail } = err.response.data;
        errorToast(detail);
      });
  };

  useEffect(() => {
    if (newRole) {
      changeMembersRole();
    }
  }, [newRole]);

  return (
    <div className={styles.memberItemContainer}>
      {deleteModal.isModalOpened && (
        <ConfirmationModal
          message={t('sure_delete_member')}
          onConfirm={() => deleteMember()}
          onClose={deleteModal.closeModal}
        />
      )}

      <div className={styles.name}>
        <img src={member} />
        <p>{name}</p>
      </div>

      <div className={styles.roleOuter}>
        <div
          ref={chooseRoleArrowRef}
          className={styles.role}
          onClick={() => {
            chooseRoleRef.current?.toggleOpened();
          }}
        >
          <p>{t(currentRole)}</p>
          <img src={arrowDown} />
        </div>

        <ChooseRoleDropdown
          ref={chooseRoleRef}
          currentRole={currentRole}
          arrowRef={chooseRoleArrowRef}
          setCurrentRole={setCurrentRole}
          setNewRole={setNewRole}
          openModal={deleteModal.openModal}
        />
      </div>
    </div>
  );
};

export default MemberItem;
