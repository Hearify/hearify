import client from '../client';

import type * as I from './AuthAPI.types';

class AuthAPI {
  // TODO(Sasha): Add types
  public static registerEmail = async (email: string): Promise<any> => {
    const response = await client.post<I.RegisterEmailRequest, I.RegisterEmailResponse>(
      '/api/auth/register/email',
      undefined,
      {
        params: {
          user_email: email,
        },
      }
    );

    return response;
  };

  public static registerGoogle = async (): Promise<string> => {
    const response = await client.get<I.RegisterGoogleResponse>('api/auth/login/google');
    return response.data.url;
  };

  public static sendVerificationEmail = async (userId: string): Promise<void> => {
    await client.post('/api/auth/send_code', {
      user_id: userId,
      send_method: 'email',
    });
  };

  public static verifyEmail = async (userId: string, code: string): Promise<I.VerifyEmailResponse> => {
    const response = await client.post('/api/auth/two-fa', {
      code,
      user_id: userId,
    });
    return response.data;
  };

  public static login = async (email: string, password: string): Promise<I.LoginResponse> => {
    const response = await client.post('/api/auth/login', { email, password });
    return response.data;
  };

  public static signInWithProvider = async (provider: string): Promise<I.SignInWithProviderResponse> => {
    const response = await client.get(`/api/auth/login/${provider}`);
    return response.data;
  };

  public static signUp = async (data: I.SignUpData): Promise<I.SignUpResponse> => {
    const response = await client.post('/api/auth/register', data);
    return response.data;
  };
}

export default AuthAPI;
