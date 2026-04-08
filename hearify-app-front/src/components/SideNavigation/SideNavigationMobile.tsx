import '@src/components/SideNavigation/SideNavigation.scss';

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import arrow from '@src/assets/images/menu/arrow.svg';
import fullLogo from '@src/assets/images/logo.svg';
import homeIcon from '@src/assets/images/home.svg';
import selectedHomeIcon from '@src/assets/images/home_selected.svg';
import quizzesIcon from '@src/assets/images/menu/file.svg';
import selectedQuizzesIcon from '@src/assets/images/menu/selected-file.svg';
import billingIcon from '@src/assets/images/menu/credit-card.svg';
import selectedBillingIcon from '@src/assets/images/menu/selected-credit-card.svg';
import settingsIcon from '@src/assets/images/menu/settings.svg';
import selectedSettingsIcon from '@src/assets/images/menu/selected-settings.svg';
import exitIcon from '@src/assets/images/menu/log-out.svg';
import MenuButton from '@src/components/SideNavigation/MenuButton';
import { useAuthStore } from '@src/store/auth';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal';
import { useSideNavigationLocalStorage } from '@src/util/hook/useSideNavigationLocalStorage.ts';
import { lngs } from '../DashboardHeader/DashboardHeader';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import Select from '../Inputs/Select';
import QuizzesCounter from '../QuizCounter/QuizCounter';
import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';
import GroupIcon from '@src/assets/images/menu/users-three.svg';

import type { TFunction } from 'i18next';

export type SideNavigationMobileProps = {
  menuActive: boolean;
  onClose: () => void;
};

const SideNavigationMobile: React.FC<SideNavigationMobileProps> = ({ menuActive, onClose }) => {
  const { t, i18n } = useTranslation('general');
  const [clickedIndexSidebar, setClickedIndexSidebar] = useSideNavigationLocalStorage();
  const [language, setLanguage] = useState<string>(lngs[i18n.language as keyof typeof lngs] ?? lngs.en);
  const navigate = useNavigate();
  const { logout } = useAuthStore((state) => state);

  const { isModalOpened, openModal, closeModal } = useConfirmationModal();

  const handleLogout = () => {
    TrackingAPI.trackEvent('authorization', {
      status: 'logout',
    });

    logout();
  };

  const changeLanguage = (language: string) => {
    setLanguage(language);
    i18n.changeLanguage(Object.keys(lngs).find((key: any) => lngs[key as keyof typeof lngs] === language));
  };

  const handleNavigationClick = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <div className={`side-nav-container ${menuActive ? 'active' : ''}`} id="mobile">
      <div className="wide-fit-element no-flex-grow" id="image_container">
        <Link to="/home" onClick={onClose}>
          <img className="wide-fit-element burger-logo" src={fullLogo} alt="logo " />
        </Link>
      </div>
      <QuizzesCounter />

      <nav className="wide-fit-element with-flex-grow flex-column-container">
        <div className="menu-nav wide-fit-element no-flex-grow">
          {getSideNavigationMenu(t).map((item, index) => {
            return index !== 0 && index !== 3 ? (
              <div
                key={index}
                className="wide-fit-element"
                onClick={() => {
                  setClickedIndexSidebar(index);
                }}
              >
                <MenuButton
                  icon={clickedIndexSidebar === index ? item.selectedIcon : item.icon}
                  text={item.text}
                  isSelected={clickedIndexSidebar === index}
                  arrow={item.isExpandable ? arrow : undefined}
                  onClick={() => handleNavigationClick(item.route)}
                />
              </div>
            ) : (
              <>
                <div className="hr-nav" />
                <div
                  key={index}
                  className="wide-fit-element"
                  onClick={() => {
                    setClickedIndexSidebar(index);
                  }}
                >
                  <MenuButton
                    icon={clickedIndexSidebar === index ? item.selectedIcon : item.icon}
                    text={item.text}
                    isSelected={clickedIndexSidebar === index}
                    arrow={item.isExpandable ? arrow : undefined}
                    onClick={() => handleNavigationClick(item.route)}
                  />
                </div>
              </>
            );
          })}
        </div>
        <div className="with-flex-grow wide-fit-element flex-container">
          <div className="element-at-the-bottom wide-fit-element">
            <MenuButton icon={exitIcon} text={t('exit')} isSelected={false} onClick={openModal} />

            <Select
              options={Object.values(lngs)}
              onSelect={changeLanguage}
              selected={language}
              width={{ width: '89px', height: '44px', padding: '10px 16px', color: '#0F172A' }}
              fontSize="14px"
            />
          </div>
        </div>
      </nav>
      {isModalOpened && <ConfirmationModal message={t('sure_exit')} onConfirm={handleLogout} onClose={closeModal} />}
    </div>
  );
};

export function getSideNavigationMenu(t: TFunction) {
  return [
    {
      icon: homeIcon,
      selectedIcon: selectedHomeIcon,
      text: t('home'),
      route: '/home',
      isExpandable: false,
    },
    {
      icon: quizzesIcon,
      selectedIcon: selectedQuizzesIcon,
      text: t('quizzes'),
      route: '/quizzes',
      isExpandable: false,
    },
    {
      icon: GroupIcon,
      selectedIcon: GroupIcon,
      text: t('groups'),
      route: '/groups',
      isExpandable: false,
    },
    {
      icon: billingIcon,
      selectedIcon: selectedBillingIcon,
      text: t('billing'),
      route: '/pricing',
      isExpandable: false,
    },
    {
      icon: settingsIcon,
      selectedIcon: selectedSettingsIcon,
      text: t('settings'),
      route: '/settings',
      isExpandable: false,
    },
  ];
}

export default SideNavigationMobile;
