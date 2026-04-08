import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';
import GenerationAPI from '@v2/api/GenerationAPI/GenerationAPI';
import QuizLoader from '@src/components/Loaders/QuizLoader';
import QuizError from '@src/components/NewQuiz/QuizError';
import UploadStep, { type UploadStepForm } from './UploadStep/UploadStep';
import CustomizeStep, { type CustomizeStepForm } from '@src/pages/NewQuiz/CustomizeStep/CustomizeStep';
import { TrackQuizSourceType, trackSuccessQuizGenerated } from '@src/util/analyticTracking';
import { errorToast } from '@src/toasts/toasts';
import ConfirmationModal from '@src/components/ConfirmationModal/ConfirmationModal';
import { useAuthStore } from '@src/store/auth';
import styles from '@src/pages/NewQuiz/NewQuiz.module.scss';

import type { QuizGenerationType } from '@v2/types/quiz';
import type { GetYoutubeTimecodesResponse } from '@v2/api/GenerationAPI/GenerationAPI.types';

const NewQuiz = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('general');

  const { changeCredits } = useAuthStore();

  const [isParametersModalOpened, setIsParametersModalOpened] = useState<boolean>(!!localStorage.getItem('uploadStep'));

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTimeCodesLoading, setIsTimeCodesLoading] = useState<boolean>(false);

  const [isLoadStorage, setIsLoadStorage] = useState<boolean>(false);

  const credits = useRef<number>(0);

  const uploadData = useRef<UploadStepForm | null>(null);
  const uploadType = useRef<QuizGenerationType | null>(null);

  const questionsNumber = useRef<number | null>(null);

  const timeCodes = useRef<GetYoutubeTimecodesResponse | null>(null);
  const classCode = useRef<string | null>(null);
  const myInterval = useRef<NodeJS.Timeout | null>(null);

  const loadYoutubeTimecodes = (url: string): Promise<void> => {
    setIsTimeCodesLoading(true);

    return GenerationAPI.getYoutubeTimecodes(url)
      .then((response) => {
        timeCodes.current = {
          from: response.from.split(':').join(''),
          to: response.to.split(':').join(''),
        };
      })
      .catch(() => {
        errorToast(t('failed_youtube'));

        TrackingAPI.trackEvent('upload_file_attempt', {
          status: 'fail',
          file_type: 'youtube',
        });
      })
      .finally(() => {
        setIsTimeCodesLoading(false);
      });
  };

  const handleUploadClick = async (values: UploadStepForm, type: QuizGenerationType) => {
    uploadData.current = { ...values };
    uploadType.current = type;

    if (type === 'youtube' && values.youtube) {
      await loadYoutubeTimecodes(values.youtube);
    }

    setCurrentPage(1);
  };

  const handleApplyParameters = (): void => {
    setIsLoadStorage(true);
    setIsParametersModalOpened(false);

    if (localStorage.getItem('customizeStep')) {
      uploadType.current = localStorage.getItem('uploadStepTab') as QuizGenerationType;
      uploadData.current = JSON.parse(localStorage.getItem('uploadStep')!) as UploadStepForm;

      const data = JSON.parse(localStorage.getItem('customizeStep')!) as CustomizeStepForm;
      if (data.to && data.from) {
        timeCodes.current = { from: data.from, to: data.to };
      }
      setCurrentPage(1);
    }
  };

  const handleBackClick = (): void => {
    localStorage.removeItem('customizeStep');
    localStorage.removeItem('customizeStepAuto');
    setCurrentPage((prev) => prev - 1);
    setIsLoadStorage(true);
  };

  const handleClearParameters = (): void => {
    localStorage.removeItem('uploadStep');
    localStorage.removeItem('uploadStepTab');
    localStorage.removeItem('customizeStep');
    localStorage.removeItem('customizeStepAuto');
    setIsParametersModalOpened(false);
  };

  const checkQuizStatus = async (taskId: string) => {
    if (!myInterval.current) return;

    const status = await GenerationAPI.getGenerationStatus(taskId);

    if (status === 'FAILURE') {
      clearInterval(myInterval.current);

      setIsLoading(false);
      setIsError(true);
    }

    if (status === 'SUCCESS') {
      clearInterval(myInterval.current);

      changeCredits(credits.current);
      trackSuccessQuizGenerated(TrackQuizSourceType.PDF);
      navigate(`/quiz/${classCode.current}?firstTime=true`);
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = (options: CustomizeStepForm): void => {
    if (!uploadType.current || !uploadData.current) return;

    setIsLoading(true);

    credits.current =
      +options.singleChoice + //
      +options.multiChoice +
      +options.fillIn +
      +options.open +
      +options.matching;

    GenerationAPI.generateQuiz(uploadType.current, uploadData.current, options)
      .then((response) => {
        localStorage.removeItem('uploadStep');
        localStorage.removeItem('uploadStepTab');
        localStorage.removeItem('customizeStep');
        localStorage.removeItem('customizeStepAuto');

        TrackingAPI.trackEvent('upload_file_attempt', {
          status: 'success',
          file_type: uploadType.current,
          quiz_level: options.difficulty,
          quiz_language: uploadData.current!.language,
        });

        questionsNumber.current = Number(options.fillIn) + Number(options.singleChoice);

        const taskId = response.task_id;
        classCode.current = response.class_code;

        myInterval.current = setInterval(() => {
          checkQuizStatus(taskId);
        }, 1000);
      })
      .catch(() => {
        setIsLoading(false);
        setIsError(true);

        TrackingAPI.trackEvent('upload_file_attempt', {
          status: 'fail',
          file_type: uploadType.current,
          quiz_level: options.difficulty,
          quiz_language: uploadData.current!.language,
        });
      });
  };

  if (isLoading) {
    return <QuizLoader />;
  }

  if (isError) {
    return <QuizError />;
  }

  return (
    <div className={styles.container}>
      {currentPage === 0 && (
        <UploadStep //
          loadStorage={isLoadStorage}
          loading={isTimeCodesLoading}
          onNextClick={handleUploadClick}
        />
      )}

      {uploadType.current && currentPage === 1 && (
        <CustomizeStep
          type={uploadType.current}
          timeCodes={timeCodes.current}
          onGenerateClick={handleGenerateQuiz}
          onBackClick={handleBackClick}
        />
      )}

      {isParametersModalOpened && (
        <ConfirmationModal
          message={t('return_previous_settings')}
          onConfirm={handleApplyParameters}
          onClose={handleClearParameters}
        />
      )}
    </div>
  );
};

export default NewQuiz;
