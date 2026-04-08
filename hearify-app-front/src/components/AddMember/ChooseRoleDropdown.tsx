import { useTranslation } from 'react-i18next';
import { forwardRef, useRef } from 'react';

import styles from '@src/components/AddMember/ChooseRoleDropdown.module.scss';
import check from '@src/assets/images/check.svg';
import useModal from '@src/hooks/useModal.tsx';
import useOutsideMouseDown from '@src/hooks/useOutsideMouseDown.ts';
import trashIcon from '@src/assets/images/trash_red.svg';
import { Button } from '@src/components/Button/Button.tsx';

export type ChooseRoleDropdownProps = {
  currentRole: string;
  arrowRef: any;
  setCurrentRole: (currentRole: string) => void;
  setNewRole: (newRole: string) => void;
  openModal: () => void;
  toggleOpened: () => void;
};

const ChooseRoleDropdown = forwardRef<any, any>(
  ({ currentRole, arrowRef, setCurrentRole, setNewRole, openModal }: ChooseRoleDropdownProps, ref) => {
    const { t } = useTranslation('general');
    const modal = useModal(ref);
    const containerRef = useRef<any>();

    const roles = ['owner', 'editor', 'viewer'];

    const ownerInfo = { title: t('owner_title'), description: t('owner_description') };
    const editorInfo = { title: t('editor_title'), description: t('editor_description') };
    const viewerInfo = { title: t('viewer_title'), description: t('viewer_description') };

    const rolesInfo = new Map();
    rolesInfo.set('owner', ownerInfo);
    rolesInfo.set('editor', editorInfo);
    rolesInfo.set('viewer', viewerInfo);

    useOutsideMouseDown(containerRef, ({ target }: any) => {
      arrowRef && !arrowRef.current.contains(target) && modal.setOpened(false);
    });

    const handleRoleClick = (newRole: string) => {
      setNewRole(newRole);
      setCurrentRole(newRole);
    };

    return (
      modal.opened && (
        <div className={styles.container} ref={containerRef}>
          {roles.map((role) => {
            return (
              <div
                className={role === currentRole ? `${styles.roleContainer} ${styles.active}` : styles.roleContainer}
                onClick={() => handleRoleClick(role)}
              >
                <div className={styles.description}>
                  <h4>{rolesInfo.get(role).title.toUpperCase()}</h4>
                  <span>{rolesInfo.get(role).description}</span>
                </div>

                {role === currentRole && <img className={styles.checkIcon} src={check} alt="Check icon" />}
              </div>
            );
          })}

          <div className={styles.deleteButton} onClick={openModal}>
            <h4>{t('delete').toUpperCase()}</h4>
            <span>{t('remove_access')}</span>
          </div>
        </div>
      )
    );
  }
);

export default ChooseRoleDropdown;
