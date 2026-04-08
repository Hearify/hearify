import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentDuplicateIcon, EllipsisVerticalIcon, LinkIcon, ShareIcon } from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CSSTransition } from 'react-transition-group';

import UserAPI from '@v2/api/UserAPI/UserAPI';
import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import AppButton from '@v2/components/AppButton/AppButton';
import ExportQuizAPI from '@v2/api/ExportQuizAPI/ExportQuizAPI';
import QuizDropdownMemberModal from './QuizDropdownMemberModal/QuizDropdownMemberModal';
import GoogleFormsIcon from '@v2/assets/icons/google-forms.svg';
import useOnClickOutside from '@v2/hooks/useOnClickOutside';
import { setClipboardText } from '@src/util/clipboard';
import { trackEvent, trackShareQuiz, TrackShareQuizSourceType, TrackShareQuizType } from '@src/util/analyticTracking';
import { errorToast, successToast } from '@src/toasts/toasts';
import { useAuthStore } from '@src/store/auth';
import usePermission from '@v2/hooks/usePermission';
import downloadBlob from '@v2/utils/downloadBlob';
import styles from './QuizDropdown.module.scss';

import type { UserQuizRole } from '@v2/types/user';
import type { Quiz } from '@v2/types/quiz';

export type QuizDropdownProps = {
  quiz: Quiz;
  group?: boolean;
  groupId?: string;
  onDelete?: (id: string) => void;
};

const QuizDropdown: React.FC<QuizDropdownProps> = ({ group, groupId, quiz, onDelete }) => {
  const { t } = useTranslation('general', { keyPrefix: 'containers.QuizDropdown' });

  const { cannot, openPermissionModal } = usePermission();

  const { logout } = useAuthStore((state) => state);

  const buttonRef = useRef<SVGSVGElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [myRole, setMyRole] = useState<UserQuizRole>('viewer');
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  const loadUserRole = (): void => {
    UserAPI.getQuizRole(quiz.class_code).then((data) => setMyRole(data));
  };

  const handleDropdownClick = (): void => {
    setIsOpened(!isOpened);
  };

  const handleExportGoogleForm = (): void => {
    localStorage.setItem('exportFormsClassCode', quiz.class_code);

    ExportQuizAPI.getGoogleFormsUrl()
      .then((url) => {
        logout();
        window.location.href = url;
      })
      .catch(() => console.log('asd'));
  };

  const handleCopyLink = (): void => {
    if (cannot('share-quiz-link')) {
      errorToast(t('verify-before-share'));
      return;
    }

    trackShareQuiz(TrackShareQuizSourceType.DROPDOWN, TrackShareQuizType.LINK);
    successToast(t('success-share'));
    setClipboardText(`${import.meta.env.VITE_BASE_URL}/waiting/${quiz.class_code}`);
  };

  const handleCopyClassCode = (): void => {
    if (cannot('share-quiz-code')) {
      errorToast(t('verify-before-share'));
      return;
    }

    trackShareQuiz(TrackShareQuizSourceType.DROPDOWN, TrackShareQuizType.CODE);
    successToast(t('success-share'));
    setClipboardText(quiz.class_code);
  };

  const handleShareQuizAccess = (): void => {
    if (cannot('share-quiz-access')) {
      openPermissionModal('share-quiz-access');
      return;
    }

    setIsModalOpened(true);
  };

  const handleDeleteQuiz = (): void => {
    trackEvent({
      event_type: 'Delete quiz',
      event_properties: {
        type: 'ExportDropdown',
        // eslint-disable-next-line no-restricted-globals
        location: location.pathname,
      },
    });

    QuizAPI.deleteQuiz(quiz._id).then(() => {
      if (!onDelete) return;
      onDelete(quiz._id);
      successToast(t('quiz_deleted'));
    });
  };

  const handleDeleteGroupQuiz = (): void => {
    GroupAPI.deleteGroupQuiz(groupId, [quiz._id])
      .then(() => successToast(t('success-delete')))
      .catch(() => errorToast(t('error-delete')));
  };

  const handleExportPDF = (): void => {
    if (cannot('export-quiz-pdf')) {
      openPermissionModal('export-quiz-pdf');
      return;
    }

    ExportQuizAPI.exportPDF(quiz.class_code)
      .then((blob) => downloadBlob(blob, `${quiz.name}-quiz.pdf`))
      .catch(() => console.error('Failed to download quiz:'));
  };

  useOnClickOutside(dropdownRef, (e) => {
    if (buttonRef.current?.contains(e.target as Node)) return;
    setIsOpened(false);
  });

  useEffect(loadUserRole, []);

  return (
    <div className={styles.wrapper}>
      <EllipsisVerticalIcon ref={buttonRef} className={styles.icon} onClick={handleDropdownClick} />

      <CSSTransition
        in={isOpened}
        timeout={100}
        unmountOnExit
        classNames={{
          enter: styles['dropdown-enter'],
          enterActive: styles['dropdown-enter-active'],
          exit: styles['dropdown-exit'],
          exitActive: styles['dropdown-exit-active'],
        }}
      >
        <div ref={dropdownRef} className={styles.container}>
          <QuizDropdownMemberModal
            visible={isModalOpened} //
            classCode={quiz.class_code}
            onClose={() => setIsModalOpened(false)}
          />

          <AppButton variant="secondary" block onClick={handleCopyLink}>
            <LinkIcon />
            {t('copy-link')}
          </AppButton>

          <AppButton variant="secondary" block onClick={handleCopyClassCode}>
            <DocumentDuplicateIcon />
            {t('copy-code')}
          </AppButton>

          {myRole === 'owner' && (
            <AppButton variant="secondary" block onClick={handleShareQuizAccess}>
              <ShareIcon />
              {t('share-access')}
            </AppButton>
          )}

          <AppButton variant="secondary" block onClick={handleExportGoogleForm}>
            <GoogleFormsIcon />
            {t('google-forms')}
          </AppButton>

          <AppButton variant="secondary" block onClick={handleExportPDF}>
            <ArrowDownTrayIcon />
            {t('download-quiz')}
          </AppButton>

          {onDelete &&
            (group ? (
              <AppButton variant="secondary" block onClick={handleDeleteGroupQuiz}>
                <TrashIcon />
                {t('delete')}
              </AppButton>
            ) : (
              <AppButton variant="secondary" block onClick={handleDeleteQuiz}>
                <TrashIcon />
                {t('delete')}
              </AppButton>
            ))}
        </div>
      </CSSTransition>
    </div>
  );
};

export default QuizDropdown;
