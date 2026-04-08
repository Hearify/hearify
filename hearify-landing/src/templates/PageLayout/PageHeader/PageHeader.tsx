import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import logoImg from '@/assets/images/logo.png';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import { headerNavigation } from '@/constants/navigation';
import styles from './PageHeader.module.scss';

const PageHeader: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDeviceLarge, isServer } = useDeviceDetect('lg');

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const { locale } = router;

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen]);

  return (
    <div className={styles.wrapper}>
      <Link href="/" className={styles.logo}>
        <Image src={logoImg} alt="Hearify logo" width={180} height={68} className={styles.logoImage} />
      </Link>

      {!isServer && isDeviceLarge ? (
        <>
          <div className={styles.navigation}>
            {headerNavigation.map(item => {
              const href = locale === 'uk' || item.isAnchor ? item.href : `https://hearify.org${item.href}`;

              return (
                <div
                  key={item.i18nKey}
                  className={styles.dropdownWrapper}
                  onMouseEnter={() => setOpenDropdown(item.i18nKey)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <div className={styles.dropdownHeader}>
                    <Link href={href} className={cn(styles.link, router.asPath === item.href && styles.linkActive)}>
                      {t(item.i18nKey)}
                    </Link>
                    {item.subItems &&
                      (openDropdown === item.i18nKey ? (
                        <ChevronUp
                          className={cn(
                            styles.dropdownIcon,
                            openDropdown === item.i18nKey && styles.dropdownIconActive,
                          )}
                        />
                      ) : (
                        <ChevronDown
                          className={cn(
                            styles.dropdownIcon,
                            openDropdown === item.i18nKey && styles.dropdownIconActive,
                          )}
                        />
                      ))}
                  </div>

                  {item.subItems && (
                    <div
                      className={cn(styles.dropdownMenu, {
                        [styles.dropdownMenuActive]: openDropdown === item.i18nKey,
                      })}
                    >
                      <div className={styles.dropdownList}>
                        {item.subItems.map(subItem => (
                          <Link
                            key={subItem.i18nKey}
                            href={subItem.href}
                            className={styles.dropdownItem}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {subItem.icon && <subItem.icon className={styles.icon} />}
                            <span>{t(subItem.i18nKey)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <AppButtonLink variant="secondary" width="110px" href="https://app.hearify.org/login">
              {t('log_in')}
            </AppButtonLink>
            <AppButtonLink href="https://app.hearify.org/signup">{t('try_for_free')}</AppButtonLink>
          </div>
        </>
      ) : (
        <>
          <button
            aria-label="Burger menu button"
            type="button"
            className={cn(styles.hamburger, isMenuOpen && styles.hamburgerActive)}
            onClick={toggleMenu}
          >
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </button>

          <div className={cn(styles.drawer, isMenuOpen && styles.drawerActive)}>
            <div className={styles.drawerContent}>
              <Link href="/">
                <Image src={logoImg} alt="Hearify logo" width={180} height={68} />
              </Link>

              <nav className={styles.navigation}>
                {headerNavigation.map(item => {
                  const href = locale === 'uk' || item.isAnchor ? item.href : `https://hearify.org${item.href}`;

                  return (
                    <div
                      key={item.i18nKey}
                      className={cn({
                        [styles.hideMenuItem]: openMobileDropdown && openMobileDropdown !== item.i18nKey,
                      })}
                    >
                      <div
                        className={cn(styles.dropdownHeader, {
                          [styles.dropdownActive]: openMobileDropdown === item.i18nKey,
                        })}
                      >
                        <Link href={href} className={cn(styles.link, router.asPath === item.href && styles.linkActive)}>
                          {t(item.i18nKey)}
                        </Link>
                        {item.subItems && (
                          <button
                            type="button"
                            onClick={() => setOpenMobileDropdown(prev => (prev === item.i18nKey ? null : item.i18nKey))}
                            className={styles.dropdownIconButton}
                          >
                            {openMobileDropdown === item.i18nKey ? (
                              <ChevronUp className={styles.dropdownIcon} />
                            ) : (
                              <ChevronDown className={styles.dropdownIcon} />
                            )}
                          </button>
                        )}
                      </div>

                      {item.subItems && (
                        <div
                          className={cn(styles.dropdownMenuMobile, {
                            [styles.dropdownMenuMobileActive]: openMobileDropdown === item.i18nKey,
                          })}
                        >
                          {item.subItems.map(subItem => (
                            <Link
                              key={subItem.i18nKey}
                              href={subItem.href}
                              className={styles.dropdownItem}
                              onClick={() => {
                                setOpenMobileDropdown(null);
                                setIsMenuOpen(false);
                              }}
                            >
                              {subItem.icon && <subItem.icon className={styles.icon} />}
                              <span>{t(subItem.i18nKey)}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className={styles.actions}>
                <AppButtonLink variant="secondary" width="110px" href="https://app.hearify.org/login">
                  {t('log_in')}
                </AppButtonLink>
                <AppButtonLink href="https://app.hearify.org/signup">{t('try_for_free')}</AppButtonLink>
              </div>
            </div>
          </div>

          <div className={cn(styles.overlay, isMenuOpen && styles.overlayActive)} />
        </>
      )}
    </div>
  );
};

export default PageHeader;
