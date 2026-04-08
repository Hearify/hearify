interface ImportMetaEnv {
  VITE_MODE: 'development' | 'production';
  VITE_BACKEND_URL: string;
  VITE_PADDLE_TOKEN: string;
  VITE_GTM_ID: string;
  VITE_PADDLE_ENV: 'sandbox' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
