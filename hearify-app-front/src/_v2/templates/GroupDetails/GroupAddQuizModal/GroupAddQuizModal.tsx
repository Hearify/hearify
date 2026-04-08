import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import AppButton from '@v2/components/AppButton/AppButton';
import AppModal from '@v2/components/AppModal/AppModal';
import AppCheckbox from '@v2/components/AppCheckbox/AppCheckbox';
import { usePageQuizzesServiceApi } from '@src/api/serviceApi/QuizzesServiceApi';
import { errorToast, successToast } from '@src/toasts/toasts';
import GroupAPI from '@v2/api/GroupAPI/GroupAPI';
import styles from './GroupAddQuizModal.module.scss';

import { Quiz } from '@v2/types/quiz';

type GroupAddQuizModalProps = {
  groupId: string;
  visible: boolean;
  onClose: () => void;
};

const GroupAddQuizzes: React.FC<GroupAddQuizModalProps> = ({ groupId, visible, onClose }) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.GroupAddQuizzesModal' });

  const navigate = useNavigate();

  const [quizzes] = usePageQuizzesServiceApi(0, 16);

  const [groupQuizzes, setGroupQuizzes] = useState<Quiz[]>([]);
  const [isChecked, setIsChecked] = useState<Record<string, boolean>>({});

  const getGroupQuizzes = (): void => {
    GroupAPI.getGroupQuizzes(groupId)
      .then((responce) => setGroupQuizzes(responce.quizzes))
      .catch(() => errorToast('bad load group quizzes'));
  };

  const handleAddSelectedQuizzes = async (groupId: any) => {
    const quizzesId = getSelectedQuizzes().map((item) => item.id);

    await GroupAPI.addQuizzes(groupId, quizzesId)
      .then(() => {
        navigate(`/groups`);
        successToast(t('success'));
      })
      .catch(() => errorToast(t('error')));
  };

  const changeChecked = (quizId: string): void => {
    setIsChecked((prev) => ({
      ...prev,
      [quizId]: !prev[quizId],
    }));
  };

  const getSelectedQuizzes = () => {
    const selectedQuizzes = quizzes.filter((item) => isChecked[item.id]);
    return selectedQuizzes;
  };

  useEffect(getGroupQuizzes, []);

  return (
    <AppModal //
      visible={visible}
      onClose={onClose}
      width="500px"
    >
      <div className={styles.wrapper}>
        <h3 className={styles.title}>{t('title')}</h3>
        <div>
          <header className={styles.header}>
            <p>{t('quizzes')}</p>
            <p>{t('add')}</p>
          </header>
          <ul className={styles.list}>
            {quizzes.map((item) => (
              <li className={styles.item} key={item.id}>
                <p>{item.name}</p>
                <AppCheckbox //
                  checked={isChecked[item.id]}
                  onChange={() => changeChecked(item.id)}
                  disabled={!!groupQuizzes.find((quiz) => quiz._id === item.id)}
                />
              </li>
            ))}
          </ul>
        </div>
        <AppButton //
          onClick={() => handleAddSelectedQuizzes(groupId)}
          size="lg"
        >
          {t('add-button')}
        </AppButton>
        <AppButton //
          size="lg"
          type="submit"
          variant="secondary"
        >
          {t('create-button')}
        </AppButton>
      </div>
    </AppModal>
  );
};

export default GroupAddQuizzes;
