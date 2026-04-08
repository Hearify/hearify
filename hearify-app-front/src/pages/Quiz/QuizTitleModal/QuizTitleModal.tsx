import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppInput from '@v2/components/AppInput/AppInput';
import AppButton from '@v2/components/AppButton/AppButton';
import { errorToast } from '@src/toasts/toasts';
import styles from './QuizTitleModal.module.scss';
import QuizAPI from '@v2/api/QuizAPI/QuizAPI';

export type QuizTitleModalProps = {
  title: string;
  quizId: string;
  onTitleChange: (title: string) => void;
};

const QuizTitleModal: React.FC<QuizTitleModalProps> = ({
  title: originalTitle, //
  quizId,
  onTitleChange,
}) => {
  const { t } = useTranslation('general');

  const [title, setTitle] = useState<string>(originalTitle);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleChangeTitle = (): void => {
    setIsLoading(true);

    QuizAPI.changeQuizTitle(quizId, title)
      .then(() => {
        onTitleChange(title);
      })
      .catch(() => {
        errorToast('Something went wrong!');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{t('change-title')}</h3>

      <AppInput //
        placeholder={t('change-title-placeholder')}
        value={title}
        onChange={handleChange}
      />

      <AppButton size="lg" loading={isLoading} block onClick={handleChangeTitle}>
        {t('save').toUpperCase()}
      </AppButton>
    </div>
  );
};

export default QuizTitleModal;
