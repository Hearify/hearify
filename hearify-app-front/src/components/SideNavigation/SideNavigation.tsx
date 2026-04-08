import '@src/components/SideNavigation/SideNavigation.scss';

import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
import QuizzesCounter from '@src/components/QuizCounter/QuizCounter';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';
import GroupIcon from '@src/assets/images/menu/users-three.svg';

import type { TFunction } from 'i18next';

const SideNavigation = () => {
  const { t } = useTranslation('general');
  const [clickedIndexSidebar, setClickedIndexSidebar] = useSideNavigationLocalStorage();
  const navigate = useNavigate();
  const { logout } = useAuthStore((state) => state);
  const { isModalOpened, openModal, closeModal } = useConfirmationModal();

  const handleLogout = () => {
    TrackingAPI.trackEvent('authorization', {
      status: 'logout',
    });

    logout();
  };

  return (
    <div className="side-nav-container">
      <div className="wide-fit-element no-flex-grow">
        <Link className="logo-link" to="/home">
          <img src={fullLogo} />
        </Link>
      </div>
      <QuizzesCounter />
      <nav className="wide-fit-element with-flex-grow flex-column-container">
        <div className="menu-nav wide-fit-element no-flex-grow">
          {getSideNavigationMenu(t).map((item, index) => {
            return index !== 0 && index !== 3 ? (
              <div
                key={index}
                id={item.id}
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
                  onClick={() => navigate(item.route)}
                />
              </div>
            ) : (
              <>
                <div className="hr-nav" />
                <div
                  id={item.id}
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
                    onClick={() => navigate(item.route)}
                  />
                </div>
              </>
            );
          })}
        </div>
        <div className="with-flex-grow wide-fit-element flex-container">
          <div className="element-at-the-bottom wide-fit-element">
            <MenuButton icon={exitIcon} text={t('exit')} isSelected={false} onClick={openModal} />
          </div>
        </div>
      </nav>
      {isModalOpened && <ConfirmationModal message={t('sure_exit')} onConfirm={handleLogout} onClose={closeModal} />}
    </div>
  );
};

interface Tab {
  icon: string;
  selectedIcon: string;
  text: string;
  route: string;
  isExpandable: boolean;
  id?: string;
}

export function getSideNavigationMenu(t: TFunction): Array<Tab> {
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
      id: 'navigation-billing-button',
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

export default SideNavigation;
