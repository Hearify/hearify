import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import logoIcon from '@src/assets/images/logo.svg';
import { useAuthStore } from '@src/store/auth';
import AppSelect, { type AppSelectOption } from '@v2/components/AppSelect/AppSelect';
import SideNavigationMobile from '../SideNavigation/SideNavigationMobile';
import './DashboardHeader.scss';

export const lngs = {
  en: 'EN',
  uk: 'UK',
};

export const languageOptions: AppSelectOption[] = [
  {
    title: 'EN',
    id: 'en',
  },
  {
    title: 'UK',
    id: 'uk',
  },
];

function DashboardHeader() {
  const { t, i18n } = useTranslation('general');
  const navigate = useNavigate();

  const [language, setLanguage] = useState<string>(i18n.language);
  const [burgerActive, setBurgerActive] = useState<boolean>(false);

  const handleChangeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleUsernameClick = () => {
    navigate('/settings');
  };

  const user = useAuthStore((state) => state.user);

  const toggleBurgerMenu = () => {
    document.body.classList.toggle('no-scroll');
    setBurgerActive(!burgerActive);
  };

  return (
    <>
      <div className="welcome-back-wrapper">
        <div className="dashboard-header-body">
          <AppSelect options={languageOptions} onSelect={handleChangeLanguage} value={language} />

          <header className="welcome-back-greeting">
            {t('welcome_back')}
            {user?.first_name ? (
              <>
                ,
                <b className="welcome-back-name" onClick={handleUsernameClick}>
                  {' '}
                  {user?.first_name}
                </b>
              </>
            ) : (
              '!'
            )}
          </header>
        </div>
      </div>

      <div className="header">
        <Link to="/home">
          <img src={logoIcon} alt="Hearify logo" height={44} />
        </Link>

        <div className={`hamburger ${burgerActive ? 'active' : ''}`} onClick={toggleBurgerMenu}>
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>

        <SideNavigationMobile menuActive={burgerActive} onClose={() => setBurgerActive(false)} />
      </div>
    </>
  );
}

export default DashboardHeader;
