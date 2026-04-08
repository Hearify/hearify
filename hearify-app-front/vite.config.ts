import EnvironmentPlugin from 'vite-plugin-environment';

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    base: '/app/',
    plugins: [
      react(),
      EnvironmentPlugin('all', { prefix: 'VITE_' }),
      svgr({
        include: '**/assets/icons/*.svg',
        svgrOptions: {
          exportType: 'default',
        }
      }),
    ],
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './src/'),
        '@v2': path.resolve(__dirname, './src/_v2/')
      },
    },
    css: {
      modules: {
        generateScopedName: isProduction
          ? '[hash:base64:5]'
          : '[name]_[local]__[hash:base64:5]',
        localsConvention: "camelCase",
      },
    },
  };
});
