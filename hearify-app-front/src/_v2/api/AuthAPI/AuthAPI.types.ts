import type { User } from '@v2/types/user';

export type RegisterEmailRequest = {
  email: string;
};

export type RegisterEmailResponse = undefined;

export type RegisterGoogleResponse = {
  url: string;
};

export type VerifyEmailResponse = {
  access_token: string;
  user: User;
};

export type SignInWithProviderResponse = {
  provider: string;
  url: string;
};

export type LoginResponse = {
  access_token: string;
  user: User;
};

export type SignUpResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type SignUpData = {
  first_name: string;
  surname: string;
  email: string;
  password: string;
  enable_mailing: boolean;
};
