import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';

import axios from '@src/api/axios';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import styles from '@src/pages/Results/PersonalStatistics/PersonalStatistics.module.scss';
import ResultsBar from '@src/components/ProgressBar/ResultsBar';
import correctIcon from '@src/assets/images/correct_answers.svg';
import ShareResultsModal from '@src/components/ShareResultsModal/ShareResultsModal';
import timeSpentIcon from '@src/assets/images/time_spent.svg';
import { formatSecondsIntoTime } from '@src/util/formatTime';
import correctGreenIcon from '@src/assets/images/correct_answer_green.svg';
import incorrectRedIcon from '@src/assets/images/incorrect_answer_red.svg';
import { defaultBrandKit } from '@src/components/BrandKit/BrandKit';
import { useFont } from '@src/util/hook/useFont';
import CustomLoadingPage from '@src/pages/LoadingPage/CustomLoadingPage';
import Header from '@src/components/Header/Header';
import AppButton from '@v2/components/AppButton/AppButton';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit';

type PersonalStatisticsProps = {
  id: string;
  is_registered: boolean;
  classCode: string | undefined;
  brandKit: BrandKitInterface;
  processId?: string;
};

const PersonalStatistics = ({ id, is_registered, classCode, brandKit, processId }: PersonalStatisticsProps) => {
  const { t } = useTranslation('general');
  const [statistics, setStatistics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTimer, setIsTimer] = useState(true);
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  const startupTypePictureUrl = useMemo<string | null>(() => {
    if (classCode !== 'hypvpvogpn') return null;
    return `${import.meta.env.VITE_BACKEND_URL}/api/quizzes/${classCode}/${processId}/startup_type`;
  }, [classCode, processId]);

  const changeModalStatus = (): void => {
    setIsModalOpened(!isModalOpened);
  };

  const ScrollContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;

    ::-webkit-scrollbar-thumb {
      background: ${brandKit.buttonFill};
    }
  `;

  if (brandKit.font) {
    useFont(brandKit.font);
  }

  const getStudent = async () => {
    setIsLoading(true);
    if (is_registered) {
      await axios
        .get(`/api/quizzes/${classCode}/${id}/statistics`)
        .then((res) => {
          setStatistics(res.data.quiz_result);
        })
        .catch((error) => {
          console.log(error);
          window.location.reload();
        });
    } else {
      await axios
        .get(`/api/public/${classCode}/${id}/statistics`)
        .then((res) => {
          setStatistics(res.data.quiz_result);
        })
        .catch((error) => {
          console.log(error);
          window.location.reload();
        });
    }
    await axios.get(`/api/quizzes/${classCode}`).then(({ data }) => {
      setIsTimer(data.settings.minutes !== 0);
    });
    setIsLoading(false);
  };

  useEffect(() => {
    getStudent();
  }, []);

  const downloadResults = async () => {
    try {
      const response = await axios.get(`/api/csv-loader/${classCode}/pdf/${processId}`, {
        responseType: 'arraybuffer',
        headers: {
          Accept: 'application/json',
        },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = `Quiz.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Quiz downloaded successfully: ${classCode}`);
    } catch (error) {
      console.error('Failed to download quiz:', error);
    }
  };

  if (isLoading || !statistics.answers) {
    if (localStorage.getItem('customLogo')) {
      // @ts-ignore
      return <CustomLoadingPage logo_url={localStorage.getItem('customLogo')} />;
    }
    return <LoadingPage />;
  }

  if (startupTypePictureUrl) {
    return (
      <div className={styles.wrapper}>
        <Helmet>
          <meta property="og:image" content={startupTypePictureUrl} />
          <meta property="og:type" content="website" />
        </Helmet>

        <ShareResultsModal
          visible={isModalOpened} //
          onClose={changeModalStatus}
          classCode={classCode}
          quizId={id}
        />
        <div className={styles.placeholder}>
          <div className={styles.body}>
            <img src={startupTypePictureUrl} alt="Startup type" className={styles.image} />
          </div>

          <p className={styles.apology}>{t('share-apology')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.root}
      style={
        brandKit !== defaultBrandKit
          ? { backgroundColor: brandKit.bgColor }
          : { backgroundImage: "url('/src/assets/images/bg-desktop.png')" }
      }
    >
      <ShareResultsModal
        visible={isModalOpened} //
        onClose={changeModalStatus}
        classCode={classCode}
        quizId={id}
      />

      <div className={styles.header}>
        <Header brandKit={brandKit} />
      </div>
      <div className={styles.container}>
        <p
          className={styles.title}
          style={{ color: brandKit.buttonFill, fontFamily: brandKit?.font?.family && brandKit.font.family }}
        >
          {t('results')}
        </p>
        <div className={styles.generalInfo}>
          <div className={styles.generalScore}>
            <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
              {t('general_score')} {Math.round(statistics.general_score * 100)}%
            </p>
            <ResultsBar
              percentage={Math.round(statistics.general_score * 100)}
              width="210px"
              color={brandKit.buttonFill}
            />
          </div>

          <div className={styles.infoLine}>
            <div>
              <img src={correctIcon} alt="Correct answer icon" />
              <p className={styles.text} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                {t('correct_answers')}
              </p>
            </div>
            <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>{statistics.total_score}</p>
          </div>

          {isTimer && (
            <div className={styles.infoLine}>
              <div>
                <img src={timeSpentIcon} alt="Time spent icon" />
                <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>{t('total_time')}</p>
              </div>
              <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                {formatSecondsIntoTime(statistics.time_spent)}
              </p>
            </div>
          )}
        </div>

        <ScrollContainer>
          <div className={styles.table}>
            <div className={styles.headerRow} style={{ backgroundColor: brandKit.bgColor }}>
              <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>№</p>
              <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>{t('question')}</p>
              <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>{t('answers')}</p>
              <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>{t('points')}</p>
            </div>
            {statistics.answers.map((answer: any, index: number) => {
              if (Array.isArray(answer.answer)) {
                return (
                  <div className={styles.row}>
                    <p id={styles.index} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                      {index + 1}
                    </p>
                    <p id={styles.question} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                      {answer.question_text}
                    </p>
                    <div
                      className={styles.answer}
                      style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}
                    >
                      <img src={answer.is_correct ? correctGreenIcon : incorrectRedIcon} alt="Answer icon" />
                      {answer.answer.map((item: any, index: number) =>
                        answer.answer.length > 2 ? `${index + 1}. ${item.text} : ${item.answer} \n` : ` ${item}. `
                      )}
                      <br />
                    </div>
                    <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                      {' '}
                      {answer.is_correct ? 1 : 0}
                    </p>
                  </div>
                );
              }

              return (
                <div className={styles.row} style={{ borderColor: brandKit.buttonFill }}>
                  <p id={styles.index} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                    {index + 1}
                  </p>
                  <p id={styles.question} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                    {answer.question_text}
                  </p>
                  <div className={styles.answer} style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                    <img src={answer.is_correct ? correctGreenIcon : incorrectRedIcon} alt="Answer icon" />{' '}
                    {answer.answer}
                  </div>
                  <p style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>
                    {answer.is_correct ? 1 : 0}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollContainer>

        {/* <button
          className={styles.download_results}
          style={{
            backgroundColor: brandKit?.bgColor ? brandKit.bgColor : '#f5f4fe',
            borderColor: brandKit?.buttonFill,
            color: brandKit?.buttonFill,
          }}
          onClick={downloadResults}
        >
          <span style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>{t('download_results')}</span>
        </button> */}
        <AppButton variant="secondary" size="lg" onClick={changeModalStatus}>
          {t('share')}
        </AppButton>
      </div>
    </div>
  );
};

export default PersonalStatistics;
