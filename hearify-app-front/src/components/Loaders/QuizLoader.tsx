import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import uploader from '@src/assets/images/uploader.svg';
import process from '@src/assets/images/pencil-square.svg';
import topic from '@src/assets/images/document-text.svg';
import question from '@src/assets/images/question.svg';
import verify from '@src/assets/images/verify.svg';
import styles from './QuizLoader.module.scss';

const QuizLoader: React.FC = () => {
  const { t } = useTranslation('general');

  const steps = [
    { text: t('uploading_your_file'), image: uploader },
    { text: t('processing_information'), image: process },
    { text: t('determining_topic'), image: topic },
    { text: t('generating_questions'), image: question },
    { text: t('verifying'), image: verify },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
    }, 1000);

    return () => clearInterval(timer);
  }, [steps.length]);

  const { image, text: currentText } = steps[currentStep];

  return (
    <div className={styles.container}>
      <img src={image} height={82} />
      <p>{currentText}</p>
      <div className={styles.second}>{t('quiz_generating_prompt_second')}</div>
    </div>
  );
};

export default QuizLoader;
