import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { QrCodeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

import styles from '@src/components/QuizPage/ExportDropdown.module.scss';
import { Button } from '../Button/Button';
import useModal from '@src/hooks/useModal';
import useOutsideMouseDown from '@src/hooks/useOutsideMouseDown';
import trashIcon from '@src/assets/images/trash_red.svg';
import linkIcon from '@src/assets/images/link-black.svg';
import copyIcon from '@src/assets/images/copy-black.svg';
import googleFormsIcon from '@src/assets/images/google_forms.svg';
import shareIcon from '@src/assets/images/share.svg';
import { setClipboardText } from '@src/util/clipboard';
import { trackEvent, trackShareQuiz, TrackShareQuizSourceType, TrackShareQuizType } from '@src/util/analyticTracking';
import { errorToast, successToast } from '@src/toasts/toasts';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal';
import ConfirmationModal from '@src/components/ConfirmationModal/ConfirmationModal';
import { useAuthStore } from '@src/store/auth';
import AddMemberModal from '@src/components/AddMember/AddMemberModal';
import QrCodeModal from '@src/components/QrCodeModal/QrCodeModal';
import AppModal from '@v2/components/AppModal/AppModal';
import usePermission from '@v2/hooks/usePermission';
import useDeviceDetect from '@v2/hooks/useDeviceDetect';

import type { AddMemberModalType } from '@src/components/AddMember/AddMemberModal';

export type DropdownType = {
  style: {};
  classCode: string;
  buttonRef: any;
  isPublic: boolean;
  quizId?: string;
  onDelete?: (id: string) => void;
  toggleOpened: () => void;
  quiz: any;
};

const ExportDropdown = forwardRef<any, any>(
  ({ style, classCode, buttonRef, isPublic, quizId, onDelete, quiz }: DropdownType, ref) => {
    const { t } = useTranslation('general');
    const modal = useModal(ref);
    const formsModal = useConfirmationModal();
    const { logout } = useAuthStore((state) => state);
    const [myRole, setMyRole] = useState('viewer');
    const [isModalOpened, setIsModalOpened] = useState(false);
    const { isDeviceLarge } = useDeviceDetect('md');

    const { cannot, openPermissionModal } = usePermission();

    const containerRef = useRef<any>();
    const addMemberRef = useRef<AddMemberModalType>(null);
    const addMemberButtonRef = useRef(null);

    useOutsideMouseDown(containerRef, ({ target }: any) => {
      buttonRef && !buttonRef.current.contains(target) && modal.setOpened(false);
    });

    const handleGoogleFormsExportClick = () => {
      if (cannot('export-google-form')) {
        openPermissionModal('export-google-form');
        return;
      }

      formsModal.openModal();
    };

    const handleGoogleFormsExportConfirm = async () => {
      localStorage.setItem('exportFormsClassCode', classCode);
      await axios
        .get('/api/google-forms/authorize')
        .then(({ data }) => {
          logout();
          window.location.href = data[0];
        })
        .catch((err) => {
          console.log(err);
        });
    };

    useEffect(() => {
      axios.get(`/api/quiz-members/${classCode}/get_my_role`).then(({ data }) => {
        setMyRole(data);
      });
    }, []);

    const downloadQuiz = async (): Promise<void> => {
      if (cannot('export-quiz-pdf')) {
        openPermissionModal('export-quiz-pdf');
        return;
      }

      try {
        const response = await axios.get(`/api/csv-loader/${classCode}/pdf`, {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'application/json',
          },
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `${quiz.name}-quiz.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log(`Quiz downloaded successfully: ${classCode}`);
      } catch (error) {
        console.error('Failed to download quiz:', error);
      }
    };

    return (
      modal.opened && (
        <div ref={containerRef} className={styles.container} style={style}>
          {formsModal.isModalOpened && (
            <ConfirmationModal
              message={t('sure_to_export_forms')}
              onConfirm={handleGoogleFormsExportConfirm}
              onClose={formsModal.closeModal}
            />
          )}

          <Button
            style="white"
            width="202px"
            fontSize="14px"
            textColor="#15343a"
            padding="10px 16px"
            onClick={() => {
              if (cannot('share-quiz-link')) {
                errorToast(t('verify-before-share'));
                return;
              }

              trackShareQuiz(TrackShareQuizSourceType.DROPDOWN, TrackShareQuizType.LINK);
              successToast('Class link has been copied to your clipboard!');
              if (!isPublic) {
                setClipboardText(`${import.meta.env.VITE_BASE_URL}waiting/${classCode}`);
              } else {
                setClipboardText(`${import.meta.env.VITE_BASE_URL}waiting/${classCode}/public`);
              }
            }}
          >
            <img src={linkIcon} />
            {t('copy_link').toUpperCase()}
          </Button>

          <Button
            style="white"
            width="202px"
            fontSize="14px"
            padding="10px 16px"
            textColor="#15343a"
            onClick={() => {
              if (cannot('share-quiz-code')) {
                errorToast(t('verify-before-share'));
                return;
              }

              trackShareQuiz(TrackShareQuizSourceType.DROPDOWN, TrackShareQuizType.CODE);
              successToast('Class code has been copied to your clipboard!');
              setClipboardText(classCode);
            }}
          >
            <img src={copyIcon} />
            {t('copy_code').toUpperCase()}
          </Button>
          <div>
            <Button
              style="white"
              width="202px"
              fontSize="14px"
              padding="10px 16px"
              textColor="#15343a"
              onClick={() => setIsModalOpened(true)}
            >
              <QrCodeIcon width={24} height={24} />
              {t('qr_code').toUpperCase()}
            </Button>
            <AppModal
              visible={isModalOpened}
              width={isDeviceLarge ? '950px' : '650px'}
              onClose={() => setIsModalOpened(false)}
            >
              <QrCodeModal
                setIsModalOpened={setIsModalOpened}
                quiz={quiz}
                qrCodeValue={
                  !isPublic
                    ? `${import.meta.env.VITE_BASE_URL}waiting/${classCode}`
                    : `${import.meta.env.VITE_BASE_URL}waiting/${classCode}/public`
                }
              />
            </AppModal>
          </div>

          {myRole === 'owner' && (
            <div ref={addMemberButtonRef}>
              <Button
                style="white"
                width="202px"
                fontSize="14px"
                padding="10px 16px"
                textColor="#15343a"
                onClick={() => {
                  if (cannot('share-quiz-access')) {
                    openPermissionModal('share-quiz-access');
                    return;
                  }
                  addMemberRef.current?.toggleOpened();
                }}
              >
                <img src={shareIcon} />
                {t('share_access').toUpperCase()}
              </Button>

              <AddMemberModal ref={addMemberRef} classCode={classCode} buttonRef={addMemberButtonRef} />
            </div>
          )}

          <Button
            style="white"
            width="202px"
            fontSize="14px"
            padding="10px 16px"
            textColor="#15343a"
            className_={styles.googleForms}
            onClick={handleGoogleFormsExportClick}
          >
            <img src={googleFormsIcon} />
            GOOGLE FORMS
          </Button>

          <Button
            style="white"
            width="202px"
            fontSize="14px"
            textColor="#15343a"
            padding="10px 16px"
            onClick={downloadQuiz}
          >
            <ArrowDownTrayIcon width={24} height={24} />
            {t('download_quiz').toUpperCase()}
          </Button>

          {onDelete && (
            <Button
              style="white"
              width="202px"
              fontSize="14px"
              padding="10px 16px"
              textColor="#BA3E00"
              onClick={() => {
                trackEvent({
                  event_type: 'Delete quiz',
                  event_properties: {
                    type: 'ExportDropdown',
                    location: location.pathname,
                  },
                });

                onDelete && onDelete(quizId as string);
              }}
            >
              <img src={trashIcon} />
              {t('delete').toUpperCase()}
            </Button>
          )}
        </div>
      )
    );
  }
);

export default ExportDropdown;
