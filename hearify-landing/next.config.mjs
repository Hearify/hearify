import withMDX from '@next/mdx';
import remarkSlug from 'remark-slug';
import remarkAutolinkHeadings from 'remark-autolink-headings';
import i18nConf from './next-i18next.config.js';

const addLangSubdomainUrl = (baseUrl, lang) => {
  const url = new URL(baseUrl);
  url.hostname = `${lang}.${url.hostname.split('.').slice(1).join('.')}`;
  return url.toString();
};

/** @type {import('next').NextConfig} */
const config = {
  i18n: i18nConf.i18n,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      // In development, proxy to local Vite dev server
      const appUrl = process.env.APP_URL || 'http://localhost:5173';
      return {
        beforeFiles: [],
        afterFiles: [],
        fallback: [
          { source: '/app', destination: `${appUrl}/app` },
          { source: '/app/:path*', destination: `${appUrl}/app/:path*` },
        ],
      };
    }
    // In production, static files in public/app/ are served by Next.js.
    // Fallback rewrites kick in only when no static file matches,
    // so /app/login, /app/signup etc. all get served index.html for SPA routing.
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: '/app', destination: '/app/index.html' },
        { source: '/app/:path*', destination: '/app/index.html' },
      ],
    };
  },

  async redirects() {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://hearify.com';

    return [
      {
        source: '/en-gb',
        destination: addLangSubdomainUrl(baseUrl, 'uk'),
        permanent: true,
      },
      {
        source: '/en-ca',
        destination: addLangSubdomainUrl(baseUrl, 'ca'),
        permanent: true,
      },
      {
        source: '/en-au',
        destination: addLangSubdomainUrl(baseUrl, 'au'),
        permanent: true,
      },
      {
        source: '/uk',
        destination: addLangSubdomainUrl(baseUrl, 'ua'),
        permanent: true,
      },

      {
        source: '/blog/articles/astronomy-and-space-quiz-test-your-knowledge-of-the-cosmos',
        destination: '/library/astronomy-and-space-quiz-test-your-knowledge-of-the-cosmos',
        permanent: true,
      },
      {
        source: '/blog/articles/world-war-2-quiz-test-your-knowledge-of-history',
        destination: '/library/world-war-2-quiz-test-your-knowledge-of-history',
        permanent: true,
      },
      {
        source: '/blog/articles/periodic-table-quiz-test-your-knowledge-of-elements',
        destination: '/library/periodic-table-quiz-test-your-knowledge-of-elements',
        permanent: true,
      },
      {
        source: '/blog/articles/80s-music-quiz-how-well-do-you-know-the-iconic-hits-of-the-1980s',
        destination: '/library/80s-music-quiz-how-well-do-you-know-the-iconic-hits-of-the-1980s',
        permanent: true,
      },
      {
        source: '/blog/articles/all-american-history-quiz-test-your-knowledge-of-us-history',
        destination: '/library/all-american-history-quiz-test-your-knowledge-of-us-history',
        permanent: true,
      },
      {
        source: '/blog/articles/the-human-body-quiz-test-your-knowledge-of-human-anatomy',
        destination: '/library/the-human-body-quiz-test-your-knowledge-of-human-anatomy',
        permanent: true,
      },
      {
        source: '/blog/articles/literature-antonyms-and-synonyms-quiz-test-your-vocabulary-skills',
        destination: '/library/literature-antonyms-and-synonyms-quiz-test-your-vocabulary-skills',
        permanent: true,
      },
      {
        source: '/blog/articles/countries-and-capitals-quiz-test-your-geography-knowledge',
        destination: '/library/countries-and-capitals-quiz-test-your-geography-knowledge',
        permanent: true,
      },
      {
        source: '/blog/articles/disney-quiz-how-well-do-you-know-your-disney-classics',
        destination: '/library/disney-quiz-how-well-do-you-know-your-disney-classics',
        permanent: true,
      },
      {
        source: '/blog/articles/who-said-this-famous-quotes-quiz',
        destination: '/library/who-said-this-famous-quotes-quiz',
        permanent: true,
      },
      {
        source: '/blog/articles/match-the-quote-to-the-movie-quiz-test-your-movie-knowledge',
        destination: '/library/match-the-quote-to-the-movie-quiz-test-your-movie-knowledge',
        permanent: true,
      },
      {
        source: '/blog/articles/us-state-capitals-quiz-how-well-do-you-know-your-state-capitals',
        destination: '/library/us-state-capitals-quiz-how-well-do-you-know-your-state-capitals',
        permanent: true,
      },

      {
        source: '/blog/articles/:slug(.*[^md])',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/blog/articles',
        destination: '/blog',
        permanent: true,
      },
    ];
  },

  webpack: (config) => {
    // camelCase CSS module exports
    config.module.rules
      .find(({ oneOf }) => !!oneOf)
      .oneOf.filter(({ use }) => JSON.stringify(use)?.includes('css-loader'))
      .reduce((acc, { use }) => acc.concat(use), [])
      .forEach(({ options }) => {
        if (options?.modules) {
          options.modules.exportLocalsConvention = 'camelCase';
        }
      });

    const svgoConfig = {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              cleanupIds: false,
            },
          },
        },
      ],
    };

    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      loader: '@svgr/webpack',
      options: {
        svgoConfig,
      },
    });

    return config;
  },
};

export default withMDX({
  options: {
    remarkPlugins: [remarkSlug, remarkAutolinkHeadings],
  },
})(config);
