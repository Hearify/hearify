import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppModal from '@src/_v2/components/AppModal/AppModal';
import AppButton from '@src/_v2/components/AppButton/AppButton';
import AppInput from '@src/_v2/components/AppInput/AppInput';
import FacebookIcon from '@src/_v2/assets/icons/facebook.svg';
import TelegramIcon from '@src/_v2/assets/icons/telegram.svg';
import TwitterIcon from '@src/_v2/assets/icons/twitter.svg';
import LinkedInIcon from '@src/_v2/assets/icons/linkedin.svg';
import { successToast } from '@src/toasts/toasts';
import styles from './ShareResultsModal.module.scss';

type ShareResultsModalProps = {
  classCode: string | undefined;
  onClose: () => void;
  visible: boolean;
  quizId: string;
};

const ShareResultsModal: React.FC<ShareResultsModalProps> = ({ quizId, classCode, visible, onClose }) => {
  const { t } = useTranslation('general');

  //   const quizUrlForExample = `https://test.hearify.org/results/dfwkgsflrx/${quizId}`;
  //   const backgroundImage = 'https://test.hearify.org/api/files/preset_3.png';
  //   const stickerImage = 'https://test.hearify.org/api/files/preset_3.png';
  //   const appID = '1067358941749120';

  const quizUrl = `${import.meta.env.VITE_BASE_URL}results/${classCode}/${quizId}`;

  const shareToTelegram = (): void => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(quizUrl)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareToTwitter = (): void => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(quizUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = (): void => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quizUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareToLinkedIn = (): void => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(quizUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  const copyQuizUrl = (): void => {
    navigator.clipboard.writeText(quizUrl);
    successToast(t('copied'));
  };

  //   const iosInstagram = async () => {
  //     const instagramUrl = `instagram-stories://share?source_application=${appID}`;

  //     try {
  //       const backgroundResponse = await fetch(backgroundImage);
  //       const stickerResponse = await fetch(stickerImage);

  //       if (!backgroundResponse.ok || !stickerResponse.ok) {
  //         throw new Error('проєбали фокту');
  //       }

  //       const data = [
  //         new ClipboardItem({
  //           'com.instagram.sharedSticker.backgroundImage': new File([await backgroundResponse.blob()], 'background.jpg', {
  //             type: 'image/jpeg',
  //           }),
  //           'com.instagram.sharedSticker.stickerImage': new File([await stickerResponse.blob()], 'sticker.png', {
  //             type: 'image/png',
  //           }),
  //         }),
  //       ];

  //       await navigator.clipboard.write(data);
  //       window.location.href = instagramUrl;
  //       console.log(instagramUrl);
  //     } catch (error) {
  //       console.log(error);
  //       console.log(instagramUrl);
  //     }
  //   };

  //   const androidInstargam = () => {
  //     const instagramUrl = `intent://share?backgroundImage=${encodeURIComponent(backgroundImageUri)}&stickerImage=${encodeURIComponent(stickerImageUri)}#Intent;package=com.instagram.android;scheme=https;end;`;
  //     console.log(instagramUrl);

  //     window.location.href = instagramUrl;
  //   };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <h1 className={styles.title}>{t('share_resoults')}</h1>
      <p className={styles.text}>{t('copy_link')}</p>
      <div className={styles.wrapper}>
        <AppInput size="lg" value={quizUrl} />
        <AppButton size="lg" onClick={copyQuizUrl}>
          {t('copy')}
        </AppButton>
      </div>
      <div className={styles.box}>
        <p className={styles.text}>{t('share_link')}</p>
        <div className={styles.icons}>
          <button onClick={shareToTwitter}>
            <TwitterIcon />
          </button>
          <button onClick={shareToFacebook}>
            <FacebookIcon />
          </button>
          <button onClick={shareToTelegram}>
            <TelegramIcon />
          </button>
          <button onClick={shareToLinkedIn}>
            <LinkedInIcon />
          </button>
          {/* <button onClick={iosInstagram}>iosInstagram</button>
          <button onClick={androidInstargam}>androidInstargam</button> */}
        </div>
      </div>
    </AppModal>
  );
};

export default ShareResultsModal;
