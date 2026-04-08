import type { Action } from '@v2/types/action';
import type { PermissionRole } from '@v2/types/permission';

// eslint-disable-next-line import/prefer-default-export
export const PERMISSION_HIERARCHY: Record<PermissionRole, Action[]> = {
  none: [],
  unverified: [],
  free: [
    'start-quiz',
    'share-quiz-code', //
    'share-quiz-link',
  ],
  basic: [
    'choose-quiz-options',
    'share-quiz-access',
    'add-question-manually',
    'export-student-results-pdf',
    'open-summary-tab',
  ],
  premium: [
    'manage-brand-kit',
    'add-quiz-cover',
    'add-question-cover',
    'enable-timer',
    'enable-leaderboard',
    'export-google-form',
    'export-quiz-pdf',
  ],
  max: [
    'upload-logo', //
  ],
};
