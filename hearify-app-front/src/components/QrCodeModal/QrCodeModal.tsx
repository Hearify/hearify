import QRCode from 'react-qr-code';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useDeviceDetect from '@v2/hooks/useDeviceDetect';
import styles from './QrCodeModal.module.scss';
import logo from '../../assets/images/logo.svg';

type QrCodeModalProps = {
  setIsModalOpened: (isOpen: boolean) => void;
  quiz: any;
  qrCodeValue: string;
};

const QrCodeModal: React.FC<QrCodeModalProps> = ({ qrCodeValue, setIsModalOpened, quiz }) => {
  const { t } = useTranslation('general');
  const { isDeviceLarge } = useDeviceDetect('md');

  return (
    <div className={styles.wrapper}>
      <img src={logo} alt="Logo" />
      <div className={styles.quiz_info}>
        <p className={styles.quiz_name}>{quiz.name}</p>
        <span className={styles.courseQuestions}>{quiz.questions.length} questions</span>
      </div>
      <div className={styles.qrCode_container}>
        <div className={styles.qrCode}>
          <QRCode size={!isDeviceLarge ? 240 : 350} value={qrCodeValue} />
        </div>
        <button type="button" onClick={() => setIsModalOpened(false)}>
          {t('close_qrcode')}
        </button>
      </div>
    </div>
  );
};

export default QrCodeModal;
