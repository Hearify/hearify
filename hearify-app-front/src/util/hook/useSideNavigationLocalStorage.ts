import { useTranslation } from 'react-i18next';

import { getSideNavigationMenu } from '@src/components/SideNavigation/SideNavigation.tsx';
import { useSideNavigationStore } from '@src/store/sideNavigationStore.ts';

export function useSideNavigationLocalStorage(): [number, (value: number) => void, (value: string) => void] {
  const { t } = useTranslation('general');
  const { sideNavigationPosition, setSideNavigationPosition } = useSideNavigationStore();

  const setLocation = (locationPathname: string) => {
    const menu = getSideNavigationMenu(t);

    let selectedItem = 0;
    for (const item of menu) {
      if (locationPathname === item.route) {
        selectedItem = menu.indexOf(item);
      }
    }

    setSideNavigationPosition(selectedItem);
  };

  return [sideNavigationPosition, setSideNavigationPosition, setLocation];
}
