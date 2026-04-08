import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trans, useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import logoImg from '@/assets/images/logo.png';
import FacebookIcon from '@/assets/icons/facebook.svg';
import LinkedInIcon from '@/assets/icons/linkedin.svg';
import InstagramIcon from '@/assets/icons/instagram.svg';
import Australia from '@/assets/flags/australia.svg';
import UK from '@/assets/flags/uk.svg';
import Ukraine from '@/assets/flags/ukraine.svg';
import USA from '@/assets/flags/usa.svg';
import Canada from '@/assets/flags/сanada.svg';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import { footerNavigation } from '@/constants/navigation';
import styles from './PageFooter.module.scss';

const localeLinks = [
  { country: 'Canada', icon: <Canada />, link: 'https://ca.hearify.org' },
  { country: 'Australia', icon: <Australia />, link: 'https://au.hearify.org' },
  { country: 'United Kingdom', icon: <UK />, link: 'https://uk.hearify.org' },
  { country: 'United States', icon: <USA />, link: 'https://hearify.org' },
  { country: 'Ukraine', icon: <Ukraine />, link: 'https://ua.hearify.org' },
];

const PageFooter: React.FC = () => {
  const { t } = useTranslation();

  const { isDeviceLarge, isDeviceSmall } = useDeviceDetect('sm');
  const { locale } = useRouter();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.phoneFooter}>
          {isDeviceSmall && (
            <nav className={styles.navigation}>
              {footerNavigation.map(item => {
                const href = locale === 'uk' || item.isAnchor ? item.href : `https://hearify.org${item.href}`;

                return (
                  <Link key={item.href} href={href} className={styles.link}>
                    {t(item.i18nKey)}
                  </Link>
                );
              })}
            </nav>
          )}

          {isDeviceSmall && (
            <div className={styles.phoneSocials}>
              <Link href="/">
                <Image src={logoImg} alt="Hearify logo" width={180} height={68} className={styles.logo} />
              </Link>
              <div className={styles.socials}>
                <div>
                  <p className={styles.subtitle}>{t('contact_us')}</p>
                  <a className={styles.email} href="mailto:info@hearify.org">
                    info@hearify.org
                  </a>
                </div>
                <div className={styles.socialsContainer}>
                  <a
                    href="https://www.facebook.com/people/Hearify/61552644703836/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook icon"
                  >
                    <FacebookIcon width={32} height={32} className={styles.icon} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/hearify/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn icon"
                  >
                    <LinkedInIcon width={32} height={32} className={styles.icon} />
                  </a>
                  <a
                    href="https://www.instagram.com/hearify.tech/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram icon"
                  >
                    <InstagramIcon width={32} height={32} className={styles.icon} />
                  </a>
                </div>
              </div>
              <ul className={styles.localLinks}>
                {localeLinks.map(link => (
                  <li key={link.link}>
                    <a href={link.link}>{link.icon}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isDeviceSmall && (
          <p className={styles.privacy}>
            <Link href="/terms-of-use">{t('terms')}</Link> | <Link href="/privacy-policy">{t('privacy')}</Link>
          </p>
        )}

        {isDeviceLarge && (
          <div className={styles.socials}>
            <p className={styles.title}>{t('follow_us')}</p>
            <div className={styles.socialsContainer}>
              <a
                href="https://www.facebook.com/people/Hearify/61552644703836/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook icon"
              >
                <FacebookIcon width={32} height={32} className={styles.icon} />
              </a>
              <a
                href="https://www.linkedin.com/company/hearify/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn icon"
              >
                <LinkedInIcon width={32} height={32} className={styles.icon} />
              </a>
              <a
                href="https://www.instagram.com/hearify.tech/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram icon"
              >
                <InstagramIcon width={32} height={32} className={styles.icon} />
              </a>
            </div>
            <div>
              <p className={styles.subtitle}>{t('contact_us')}</p>
              <a className={styles.email} href="mailto:info@hearify.org">
                info@hearify.org
              </a>
            </div>
          </div>
        )}

        <div className={styles.terms}>
          {isDeviceLarge && (
            <Link href="/">
              <Image src={logoImg} alt="Hearify logo" width={180} height={68} className={styles.logo} />
            </Link>
          )}
          {isDeviceLarge && (
            <p className={styles.privacy}>
              <Trans i18nKey="terms_of_use_and_privacy_policy">
                Be sure to take a look at our <Link href="/terms-of-use/">Terms of Use</Link> and{' '}
                <Link href="/privacy-policy">Privacy Policy</Link>
              </Trans>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          {isDeviceLarge && (
            <nav className={styles.navigation}>
              {footerNavigation.map(item => {
                const href = locale === 'uk' || item.isAnchor ? item.href : `https://hearify.org${item.href}`;

                return (
                  <Link href={href} key={item.href} className={styles.link}>
                    {t(item.i18nKey)}
                  </Link>
                );
              })}
            </nav>
          )}

          {isDeviceLarge && (
            <ul className={styles.localLinks}>
              {localeLinks.map(link => (
                <li key={link.link}>
                  <a href={link.link}>{link.icon}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageFooter;
