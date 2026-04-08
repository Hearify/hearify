module.exports = {
  debug: process.env.NODE_ENV === 'development',
  i18n: {
    locales: ['en', 'uk', 'en-GB', 'en-CA', 'en-AU'],
    defaultLocale: 'en',
    localeDetection: false,
    domains: [
      {
        domain: 'ca.hearify.org',
        defaultLocale: 'en-CA',
      },
      {
        domain: 'au.hearify.org',
        defaultLocale: 'en-AU',
      },
      {
        domain: 'ua.hearify.org',
        defaultLocale: 'uk',
      },
      {
        domain: 'uk.hearify.org',
        defaultLocale: 'en-GB',
      },
      {
        domain: 'hearify.org',
        defaultLocale: 'en',
      },
    ],
  },
};

// uk.hearify.org (Британія)
// ca.hearify.org (Канада)
// au.hearify.org (Австралія)
// ua.hearify.org (Україна)
