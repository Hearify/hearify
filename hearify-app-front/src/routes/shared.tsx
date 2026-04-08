import GoogleFormsHandleAuth from '@src/components/GoogleForms/GoogleFormsHandleAuth';
import QuizFlow from '@v2/templates/QuizFlow/QuizFlow';
import QuizFlowLayout from '@v2/layouts/QuizFlowLayout/QuizFlowLayout';
import Results from '@src/pages/Results/Results';
import JoinQuiz from '@v2/templates/JoinQuiz/JoinQuiz';

import type { RouteProps } from 'react-router-dom';

const sharedRoutes: RouteProps[] = [
  {
    path: '/google_forms/oauth/callback',
    element: <GoogleFormsHandleAuth />,
  },
  {
    path: '/join-quiz/',
    element: (
      <QuizFlowLayout>
        <JoinQuiz />
      </QuizFlowLayout>
    ),
  },
  {
    path: '/waiting/:classCode',
    element: (
      <QuizFlowLayout>
        <QuizFlow />
      </QuizFlowLayout>
    ),
  },
  {
    path: '/waiting/:classCode/public',
    element: (
      <QuizFlowLayout>
        <QuizFlow />
      </QuizFlowLayout>
    ),
  },
  {
    path: '/quiz_flow/:classCode',
    element: (
      <QuizFlowLayout>
        <QuizFlow />
      </QuizFlowLayout>
    ),
  },
  {
    path: '/quiz_flow/:classCode/public',
    element: (
      <QuizFlowLayout>
        <QuizFlow />
      </QuizFlowLayout>
    ),
  },
  {
    path: '/results/:classCode/:processId',
    element: <Results />,
  },
];

export default sharedRoutes;
