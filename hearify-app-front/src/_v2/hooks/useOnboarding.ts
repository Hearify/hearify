import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TourGuideClient } from '@sjmc11/tourguidejs';

import type { TFunction } from 'i18next';

let tourGuideInstance: TourGuideClient | null = null;

const getOnboardingSteps = (t: TFunction) => [
  {
    title: t('create-quiz-title'),
    content: t('create-quiz-description'),
    target: '#generate-quiz-button',
    group: 'home',
  },
  {
    title: t('join-quiz-title'),
    content: t('join-quiz-description'),
    target: '#join-quiz-button',
    group: 'home',
  },
  {
    title: t('choose-plan-title'),
    content: t('choose-plan-description'),
    target: '#navigation-billing-button',
    group: 'home',
  },
  {
    title: t('create-quiz-title'),
    content: t('create-quiz-description'),
    target: '#create-quiz-button',
    group: 'quiz-list',
  },
  {
    title: t('edit-quiz-title'),
    content: t('edit-quiz-description'),
    target: '#edit-quiz-title-button',
    group: 'quiz-details',
  },
  {
    title: t('share-quiz-title'),
    content: t('share-quiz-description'),
    target: '#share-quiz-button',
    group: 'quiz-details',
  },
  {
    title: t('view-stats-title'),
    content: t('view-stats-description'),
    target: '#quiz-tab-students',
    group: 'quiz-details',
  },
  {
    title: t('view-summary-title'),
    content: t('view-summary-description'),
    target: '#quiz-tab-summary',
    group: 'quiz-details',
  },
  {
    title: t('fill-account-title'),
    content: t('fill-account-description'),
    target: '#user-information-block',
    group: 'settings',
  },
];

const useOnboarding = (
  group: 'home' | 'quiz-list' | 'quiz-details' | 'settings', //
  loading: boolean = false
): void => {
  const { t } = useTranslation('general', { keyPrefix: 'hooks.useOnboarding' });

  const isStarted = useRef<boolean>(false);

  useEffect(() => {
    if (loading || isStarted.current) return;

    if (!tourGuideInstance) {
      tourGuideInstance = new TourGuideClient({
        nextLabel: t('next'),
        prevLabel: t('back'),
        finishLabel: t('finish'),
        dialogZ: 1000000,
        steps: getOnboardingSteps(t),
      });
    }

    tourGuideInstance.onAfterExit(() => {
      tourGuideInstance?.finishTour(false, group);
    });

    isStarted.current = true;

    if (localStorage.getItem('tg_tours_complete')?.includes(group)) {
      return;
    }

    setTimeout(() => {
      tourGuideInstance?.start(group);
    }, 300);
  }, [loading]);
};

export default useOnboarding;
