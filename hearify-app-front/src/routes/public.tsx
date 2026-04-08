import { Navigate } from 'react-router-dom';

import SupabaseAuthHandle from '@src/components/SupabaseAuth/SupabaseAuthHandle';
import SignIn from '@src/pages/SignInPage/SignIn';
import SignUp from '@src/pages/SignUpPage/SignUp';
import ChangePasswordEmail from '@src/components/ChangePasswordEmail/ChangePasswordEmail';
import ResetPassword from '@src/components/ChangePasswordEmail/ResetPassword/ResetPassword';

import type { RouteProps } from 'react-router-dom';

const publicRoutes: RouteProps[] = [
  {
    path: '/oauth/callback',
    element: <SupabaseAuthHandle />,
  },
  {
    path: '/login',
    element: <SignIn />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/change-password/email',
    element: <ChangePasswordEmail />,
  },
  {
    path: '/reset_password/:reset_token',
    element: <ResetPassword />,
  },
  {
    path: '/register',
    element: <Navigate to="/signup" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
];

export default publicRoutes;
