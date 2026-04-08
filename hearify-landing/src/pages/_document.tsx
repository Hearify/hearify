import { Html, Head, Main, NextScript } from 'next/document';
import { GoogleTagManager } from '@next/third-parties/google';

const Document = () => {
  return (
    <Html>
      <Head>
        <GoogleTagManager gtmId="GTM-PV5D2MP9" />
      </Head>
      <body>
        {/* <!-- Google Tag Manager (noscript) --> */}
        <noscript>
          <iframe
            title="Google Tag Manager"
            src="https://www.googletagmanager.com/ns.html?id=GTM-PV5D2MP9"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* <!-- End Google Tag Manager (noscript) --> */}

        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
