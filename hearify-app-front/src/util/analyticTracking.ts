import * as amplitude from '@amplitude/analytics-browser';
import { useEffect } from 'react';
import Hotjar from '@hotjar/browser';

export function trackEvent(eventInput: any) {
  amplitude.track(eventInput);
  // amplitude.logEvent(user.id.toString());
}

export function initTracking() {
  initHotjar();
  initAmplitude();
}

export function initAmplitude() {
  useEffect(() => {
    const amplitudeId = import.meta.env.VITE_AMPLITUDE_KEY;
    // const isProdMode = import.meta.env.VITE_MODE === 'PROD';
    const isProdMode = true;

    if (isProdMode) {
      amplitude.init(amplitudeId, undefined, {
        logLevel: amplitude.Types.LogLevel.Error,
        useBatch: true,
        defaultTracking: {
          sessions: true,
        },
      });
    }
  }, []);
}

export function initHotjar() {
  useEffect(() => {
    const hotjarId = import.meta.env.VITE_HOTJAR_ID;
    const hotjarVersion = import.meta.env.VITE_HOTJAR_VERSION;
    const isProdMode = import.meta.env.VITE_MODE === 'production';

    if (isProdMode) {
      Hotjar.init(parseInt(hotjarId), parseInt(hotjarVersion));
    }
  }, []);
}

export function trackSignIn() {
  trackEvent({
    event_type: 'SignIn',
  });
}

export function trackSignUp() {
  trackEvent({
    event_type: 'SignUp',
  });
}

export function trackAccountVerified() {
  trackEvent({
    event_type: 'AccountVerified',
  });
}

export function trackFinishedSurvey() {
  trackEvent({
    event_type: 'FinishedSurvey',
  });
}

export enum TrackQuizSourceType {
  PDF = 'pdf',
  YOUTUBE = 'youtube',
  TEXT = 'text',
}

export function trackSuccessQuizGenerated(sourceType: TrackQuizSourceType) {
  trackEvent({
    event_type: 'SuccessQuizGenerated',
    event_properties: {
      sourceType,
    },
  });
}

export function trackStartQuiz() {
  trackEvent({
    event_type: 'StartQuiz',
  });
}

export enum TrackShareQuizType {
  CODE = 'Code',
  LINK = 'Link',
}

export enum TrackShareQuizSourceType {
  DROPDOWN = 'Dropdown',
  QUIZ_HOLDER = 'QuizHolder',
}

export function trackShareQuiz(sourceType: TrackShareQuizSourceType, shareType: TrackShareQuizType) {
  trackEvent({
    event_type: 'ShareQuiz',
    event_properties: {
      sourceType,
      shareType,
    },
  });
}

export function trackPaymentSuccess() {
  trackEvent({
    event_type: 'PaymentSuccess',
  });
}
