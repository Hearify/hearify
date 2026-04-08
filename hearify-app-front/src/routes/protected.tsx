import { Navigate } from 'react-router-dom';

import LayoutSideNavigation from '@src/components/LayoutSideNavigation/LayoutSideNavigation';
import Pricing from '@v2/templates/Pricing/Pricing';
import Settings from '@src/pages/Settings/Settings';
import NewQuiz from '@src/pages/NewQuiz/NewQuiz';
import Quiz from '@src/pages/Quiz/Quiz';
import PaymentSuccessPage from '@v2/templates/PaymentSuccessPage/PaymentSuccessPage';
import Verify from '@v2/templates/Verify/Verify';
import QuizList from '@v2/templates/QuizList/QuizList';
import Home from '@v2/templates/Home/Home';
import GroupList from '@v2/templates/GroupList/GroupList';
import GroupDetails from '@v2/templates/GroupDetails/GroupDetails';

import type { RouteProps } from 'react-router-dom';

const protectedRoutes: RouteProps[] = [
  {
    path: '/home',
    element: (
      <LayoutSideNavigation>
        <Home />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/quizzes',
    element: (
      <LayoutSideNavigation>
        <QuizList />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/groups',
    element: (
      <LayoutSideNavigation>
        <GroupList />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/groups/:groupId',
    element: (
      <LayoutSideNavigation>
        <GroupDetails />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/join_group/:groupId/:userId',
    element: (
      <LayoutSideNavigation>
        <GroupDetails />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/pricing',
    element: (
      <LayoutSideNavigation>
        <Pricing />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/settings',
    element: (
      <LayoutSideNavigation>
        <Settings />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/generate-quiz',
    element: (
      <LayoutSideNavigation>
        <NewQuiz />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/quiz/:classCode',
    element: (
      <LayoutSideNavigation>
        <Quiz />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/payment-success/:plan',
    element: (
      <LayoutSideNavigation>
        <PaymentSuccessPage />
      </LayoutSideNavigation>
    ),
  },
  {
    path: '/verify',
    element: <Verify />,
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
];

export default protectedRoutes;
