import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UploadFileInput from '@src/components/UploadFileInput/UploadFileInput';
import styles from './UploadFileModal.module.scss';
import closeIcon from '../../assets/images/closeIcon.png';
import Gallery from '@src/components/UploadFileModal/Gallery/Gallery';

interface UploadModalProps {
  setIsOpened: (b: boolean) => void;
  setPictureId?: (p: string) => void;
  setQuestionPictureId?: (p: string) => void;
  setIsQuestionImage?: (b: boolean) => void;
  isQuestionImage?: boolean;
  questionId?: string;
  onPictureUpload?: (pictureUrl?: string) => void;
}

const UploadFileModal = ({
  setIsOpened,
  setPictureId = () => {},
  setQuestionPictureId = () => {},
  setIsQuestionImage = () => {},
  isQuestionImage,
  questionId,
  onPictureUpload = () => {},
}: UploadModalProps) => {
  const { classCode } = useParams<{ classCode: string }>();
  const [preset, setPreset] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [resetFileInput, setResetFileInput] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const { t } = useTranslation('general');

  const clearPreset = () => {
    setPreset('');
  };

  const handleSetPreset = (presetId: string) => {
    setPreset(presetId);
    setImage(null);
    setResetFileInput(true);
  };

  const handleSetImage = (file: File | null) => {
    setImage(file);
    setPreset('');
    setResetFileInput(false);
  };

  const uploadImage = async () => {
    if (!classCode && questionId === '') {
      return;
    }

    setIsImageUploaded(true);

    const isPreset = Boolean(preset);
    let url;
    const formData = new FormData();
    if (isQuestionImage) {
      url = `/api/quizzes/question/${questionId}/picture?is_preset=${isPreset}`;
      formData.append('question_id', questionId);
    } else {
      url = `/api/quizzes/${classCode}/picture?is_preset=${isPreset}`;
      formData.append('class_code', classCode);
    }

    if (preset) {
      url += `&preset_number=${preset}`;
    }

    if (image) {
      formData.append('file', image);
    }

    try {
      const request = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const pictureId: string = request.headers['picture-id'];
      if (isQuestionImage) {
        setQuestionPictureId(pictureId);
      } else {
        setPictureId(pictureId);
      }
      setIsOpened(false);

      onPictureUpload(image ? URL.createObjectURL(image) : undefined);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const closeModal = () => {
    setIsOpened(false);
    setIsQuestionImage(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.title}>{t('upload')}</p>
          <button className={styles.close_modal_btn} onClick={closeModal} type="button">
            <img src={closeIcon} draggable="false" alt="Exit icon" />
          </button>
        </div>
        <UploadFileInput handleSetImage={handleSetImage} resetFileInput={resetFileInput} clearPreset={clearPreset} />
        <div className={styles.gallery}>
          <p className={styles.gallery_title}>{t('choose_image_gallery')}</p>
          <Gallery handleSetPreset={handleSetPreset} />
        </div>
        <div className={styles.upload_container}>
          <button
            type="button"
            className={`${styles.upload_btn} ${isImageUploaded ? styles.uploaded : ''}`}
            onClick={uploadImage}
            disabled={isImageUploaded}
          >
            {t('add_image')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;
