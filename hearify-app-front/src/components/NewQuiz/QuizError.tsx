import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from '@src/components/NewQuiz/GenerateError.module.scss';
import errorIcon from '@src/assets/images/exclamation-circle-Bold.svg';
import Button from '../Button/Button';

const QuizError = () => {
  const { t } = useTranslation('general');
  const navigate = useNavigate();

  return (
    <div className={styles.content_wrapper}>
      <img src={errorIcon} />

      <p className={styles.message}>{t('generate_error')}</p>

      <div className={styles.control}>
        <Button style="purple" padding="8px 16px" fontSize="16px" width="270px" onClick={() => navigate('/home')}>
          {t('go_back').toUpperCase()}
        </Button>
      </div>
    </div>
  );
};

export default QuizError;
