import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import useModal from '@src/hooks/useModal';
import MemberItem from '@src/components/AddMember/MemberItem';
import useOutsideMouseDown from '@src/hooks/useOutsideMouseDown';
import { errorToast, successToast } from '@src/toasts/toasts';
import styles from './AddMemberModal.module.scss';

export type AddMemberModalType = {
  classCode: string;
  buttonRef: any;
  toggleOpened: () => void;
};

interface Owner {
  id: string;
  name: string;
}

const AddMemberModal = forwardRef<any, any>(({ classCode }: AddMemberModalType, ref) => {
  const { t } = useTranslation('general');

  const modal = useModal(ref);
  const containerRef = useRef<any>();
  const [owner, setOwner] = useState<Owner | null>(null);

  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState(t('provide_email'));

  useOutsideMouseDown(containerRef, () => {
    modal.setOpened(false);
  });

  const handleInviteButtonClick = async (email: string) => {
    const newMemberData = {
      email,
      role: 'editor',
    };

    axios
      .post(`/api/quiz-members/${classCode}/add_member`, newMemberData)
      .then(({ data }) => {
        if (data.success) {
          getMembers();
          successToast(t('add_member_success'));
        }
      })
      .catch((err) => {
        const { detail } = err.response.data;
        errorToast(detail);
      });
  };

  const getMembers = async () => {
    axios
      .get(`/api/quiz-members/${classCode}/get_members`)
      .then(({ data }) => {
        setMembers(data.members);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getMembers();
  }, [JSON.stringify(members)]);

  useEffect(() => {
    axios.get('/api/users/me').then(({ data }) => {
      setOwner({
        name: data.surname ? `${data.first_name} ${data.surname}`.toUpperCase() : data.first_name.toUpperCase(),
        id: data.id,
      });
    });
  }, []);

  return (
    modal.opened && (
      <div className={styles.overlay}>
        <div ref={containerRef} className={styles.container}>
          <div className={styles.inputGroup}>
            <input
              defaultValue="Email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
            <button onClick={() => handleInviteButtonClick(email)}>{t('invite')}</button>
          </div>

          <h4 className={styles.membersTitle}>{t('team_members')}</h4>

          <div>
            {owner && (
              <MemberItem
                userId={owner.id}
                name={owner.name}
                role="owner"
                classCode={classCode}
                getMembers={getMembers}
              />
            )}

            {members.map((member) => {
              return (
                // @ts-ignore
                <MemberItem
                  userId={member.user.id}
                  name={
                    member.user.surname
                      ? `${member.user.first_name} ${member.user.surname}`.toUpperCase()
                      : member.user.first_name.toUpperCase()
                  }
                  role={member.role}
                  classCode={classCode}
                  getMembers={getMembers}
                />
              );
            })}
          </div>
        </div>
      </div>
    )
  );
});

export default AddMemberModal;
