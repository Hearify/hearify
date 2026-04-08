import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import LeaderBoard from '@src/pages/Results/LeaderBoard/LeaderBoard';
import PersonalStatistics from '@src/pages/Results/PersonalStatistics/PersonalStatistics';
import usePersistState from '@src/util/hook/usePersistState';
import axios from '@src/api/axios';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import { defaultBrandKit, mapToBrandKitInterface } from '@src/components/BrandKit/BrandKit';
import CustomLoadingPage from '@src/pages/LoadingPage/CustomLoadingPage';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit';

const Results = () => {
  const { classCode, processId } = useParams();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isPublic, setIsPublic] = usePersistState<boolean | string>('', 'resultIsPublic');
  const [id, setId] = usePersistState<string>('', 'resultId');
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [ownerId, setOwnerId] = useState<string>();
  const [brandKit, setBrandKit] = useState<BrandKitInterface>(defaultBrandKit);

  const fetchQuizSettings = async () => {
    await axios.get(`/api/quiz-process/${processId}`).then(({ data }) => {
      console.log(data.user_id);
      if (data.user_id) {
        setId(data.user_id);
        setIsPublic(false);
      } else {
        // @ts-ignore
        setId(processId);
        setIsPublic(true);
      }
    });

    await axios.get(`/api/public/quizzes/${classCode}`).then(({ data }) => {
      setShowLeaderboard(data.settings.show_leaderboard);
      setOwnerId(data.user_id);
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 600);
  }, [isReady]);

  useEffect(() => {
    setIsLoading(true);
    fetchQuizSettings();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/brand-kit/${ownerId}`)
      .then(({ data }) => {
        setBrandKit(mapToBrandKitInterface(data));
      })
      .catch((err) => {
        console.log(err);
      });
    setIsLoading(false);
  }, [ownerId]);

  useEffect(() => {
    const handleUnload = () => {
      if (localStorage.getItem('customLogo')) {
        localStorage.removeItem('customLogo');
      }
    };

    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  if (isLoading || !isReady) {
    if (localStorage.getItem('customLogo')) {
      // @ts-ignore
      return <CustomLoadingPage logo_url={localStorage.getItem('customLogo')} />;
    }
    return <LoadingPage />;
  }

  if (showLeaderboard) {
    return <LeaderBoard classCode={classCode} brandKit={brandKit} />;
  }

  return (
    <PersonalStatistics
      classCode={classCode}
      is_registered={!isPublic}
      id={id}
      processId={processId}
      brandKit={brandKit}
    />
  );
};

export default Results;
