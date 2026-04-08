import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { appWithTranslation } from 'next-i18next';
import { Nunito, Caveat } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import PageLayout from '@/templates/PageLayout/PageLayout';
import '@/styles/globals.scss';

import type { AppProps } from 'next/app';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-caveat',
});

// Suppress useLayoutEffect (and its warnings) when not running in a browser.
if (typeof window === 'undefined') {
  React.useLayoutEffect = () => {};
}

/* eslint-disable react/jsx-props-no-spreading */
const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  const cleanPath = router.asPath.split('#')[0].split('?')[0];
  const canonicalEnUrl = `https://hearify.org${cleanPath === '/' ? '' : cleanPath}`;
  const canonicalUkUrl = `https://ua.hearify.org${cleanPath === '/' ? '' : cleanPath}`;

  const canonicalUrl = router.locale === 'uk' ? canonicalUkUrl : canonicalEnUrl;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, maximum-scale=5, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hearify" />
        <meta key="og:image" property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL}/main-image.png`} />

        <link rel="alternate" hrefLang="en" href="https://hearify.org/" />
        <link rel="alternate" hrefLang="en-GB" href="https://uk.hearify.org" />
        <link rel="alternate" hrefLang="en-CA" href="https://ca.hearify.org" />
        <link rel="alternate" hrefLang="en-AU" href="https://au.hearify.org" />
        <link rel="alternate" hrefLang="uk-UA" href="https://ua.hearify.org" />
        <link rel="alternate" hrefLang="x-default" href="https://hearify.org/" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" href={canonicalEnUrl} hrefLang="en" />
        <link rel="alternate" href={canonicalUkUrl} hrefLang="uk" />

        {/* HomePage has its own canonical url with additional locales */}
        {cleanPath !== '/' && <link rel="canonical" href={canonicalUrl} />}

        {/* TODO(Sasha): Add icons */}
        {/* <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /> */}
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" /> */}
        {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> */}
        {/* <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" /> */}
        {/* <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" /> */}
        {/* <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" /> */}
        {/* <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" /> */}
        {/* <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/apple-touch-icon-76x76-precomposed.png" /> */}
        {/* <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120-precomposed.png" /> */}
        {/* <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/apple-touch-icon-152x152-precomposed.png" /> */}
        {/* <link rel="shortcut icon" type="image/x-icon" href="/mstile-150x150.png" /> */}
        {/* <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#4535ff" /> */}
        <meta name="robots" content="index, follow" />
      </Head>

      <div className={`${nunito.variable} ${caveat.variable}`}>
        <Script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PV5D2MP9'); `,
          }}
        />

        <Script
          id="hotjar-tracking-code"
          strategy="afterInteractive"
          defer
          dangerouslySetInnerHTML={{
            __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:4934986,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv='); `,
          }}
        />

        <PageLayout>
          <Component {...pageProps} />
          <ToastContainer position="top-center" autoClose={5000} />
        </PageLayout>
      </div>
    </>
  );
};

export default appWithTranslation(App);
