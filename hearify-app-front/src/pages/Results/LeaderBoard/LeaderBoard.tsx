import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import List from '@src/components/Leaderboard/List';
import styles from '@src/pages/Results/LeaderBoard/LeaderBoard.module.scss';
import axios from '@src/api/axios';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import { calculatePercentage } from '@src/util/user';
import { defaultBrandKit } from '@src/components/BrandKit/BrandKit.tsx';
import { useFont } from '@src/util/hook/useFont.ts';
import CustomLoadingPage from '@src/pages/LoadingPage/CustomLoadingPage.tsx';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit.tsx';
import type { LeaderboardResponse } from '@src/interfaces/LeaderboardResponse';
import type { User } from '@src/interfaces/User';

type LeaderBoardProps = {
  classCode: string | undefined;
  brandKit: BrandKitInterface;
};

const LeaderBoard = ({ classCode, brandKit }: LeaderBoardProps) => {
  const { t } = useTranslation('general');
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [skip, setSkip] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(0);

  // const fetchMoreData = () => {
  //
  //   const fetchedAvatarsAndUsernames = fetchAvatarsAndUsernames(skip, limit);
  //   fetchedAvatarsAndUsernames
  //       .then((users:any) => {
  //         users.length > 0 ? setHasMore(true) : setHasMore(false);
  //         setUsers((prevItems) => [...prevItems, ...users]);
  //       })
  // };

  if (brandKit.font) {
    useFont(brandKit.font);
  }

  useEffect(() => {
    axios.get(`/api/public/${classCode}/is_public/`).then((res) => {
      if (!res.data && location.pathname.includes('public')) {
        setError(403);
      }
    });
  }, []);

  if (error == 403) {
    navigate('/login');
  }

  const fetchAvatarsAndUsernames = async (skip: number, limit: number) => {
    let users: User[] = [];
    try {
      const res = await axios.get(`/api/quizzes/${classCode}/leaderboard?limit=${limit}&skip=${skip}`);
      users = res.data.leaderboard.map((leaderboardResponse: LeaderboardResponse) => {
        return {
          first_name: leaderboardResponse.user.first_name,
          percentage: calculatePercentage(leaderboardResponse.correct_answers, leaderboardResponse.questions),
        };
      });

      users.sort((a, b) => {
        if (typeof a.percentage === 'number' && typeof b.percentage === 'number') {
          return b.percentage - a.percentage;
        }
        return 0;
      });
    } catch (error) {
      console.log('error in classcode', error);
      return undefined;
    }

    let avatarPromises: Promise<User | void>[] = [];

    avatarPromises = users.map(async (user: User) => {
      try {
        const avatarRes = await axios.get(`/api/files/random-avatar/`);
        return {
          ...user,
          avatar: avatarRes.data,
        };
      } catch (error) {
        console.log('error in getting avatar', error);
        return undefined;
      }
    });

    const updatedStudents: (User | void)[] = await Promise.all(avatarPromises);

    const filteredStudents = updatedStudents.filter((user): user is User => user !== undefined);
    setIsLoading(false);
    setSkip((current) => (current += 10));
    setUsers(filteredStudents);
    return filteredStudents;
  };

  // const onScrollPaginate = () => {
  //   // setSkip(skip + 10);
  //   setLimit(limit + 10);
  //   onScrollDownPaginate(() => fetchAvatarsAndUsernames(skip, limit));
  // };

  useEffect(() => {
    setIsLoading(true);
    const fetchedAvatarsAndUsernames = fetchAvatarsAndUsernames(skip, limit);
    fetchedAvatarsAndUsernames.catch((error) => {
      console.error('Error in fetching avatars, usernames:', error);
      setIsLoading(false);
    });
  }, []);

  const handleButtonClick = () => {
    navigate('/home');
  };

  if (isLoading) {
    if (localStorage.getItem('customLogo')) {
      // @ts-ignore
      return <CustomLoadingPage logo_url={localStorage.getItem('customLogo')} />;
    }
    return <LoadingPage />;
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
      <div className={styles.container}>
        <p
          className={styles.title}
          style={{ color: brandKit.buttonFill, fontFamily: brandKit?.font?.family && brandKit.font.family }}
        >
          Leaderboard
        </p>
        {/* <InfiniteScroll */}
        {/*  pageStart={0} */}
        {/*  loadMore={fetchMoreData} */}
        {/*  hasMore={hasMore} */}
        {/* > */}
        <List students={users} brandKit={brandKit} />
        <Link to="/home">
          <button className={styles.backHome} style={{ borderColor: brandKit.buttonFill }}>
            <span style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}>{t('back_home')}</span>
          </button>
        </Link>
        {/* </InfiniteScroll> */}
      </div>
    </div>
  );
};

export default LeaderBoard;
