import { useContext, useMemo } from 'react';
import { Ability, AbilityBuilder } from '@casl/ability';

import { useAuthStore } from '@src/store/auth';
import { PermissionModalContext } from '@v2/context/PermissionModalContext';
import { PERMISSION_HIERARCHY } from '@v2/constants/permission';

import type { Action } from '@v2/types/action';
import type { PermissionRole } from '@v2/types/permission';

/* eslint-disable no-restricted-syntax */
const getAllowedActions = (userRole: PermissionRole): Action[] => {
  const allActions: Set<Action> = new Set();

  for (const role of Object.keys(PERMISSION_HIERARCHY) as PermissionRole[]) {
    PERMISSION_HIERARCHY[role].forEach((action) => allActions.add(action));
    if (role === userRole) break;
  }

  return Array.from(allActions);
};

const defineAbilitiesFor = (userRole: PermissionRole) => {
  const { can, build } = new AbilityBuilder<Ability<[Action, '*']>>(Ability);

  const allowedActions = getAllowedActions(userRole);

  allowedActions.forEach((action) => {
    can(action, '*');
  });

  return build();
};

const usePermission = () => {
  const { user, subscription } = useAuthStore((state) => state);

  const permissionModalContext = useContext(PermissionModalContext);

  const userRole = useMemo<PermissionRole>(() => {
    if (!user) return 'none';
    if (!subscription) return 'free';

    return subscription.name;
  }, [user, subscription]);

  const ability = defineAbilitiesFor(userRole);

  const can = (action: Action) => {
    return ability.can(action, '*');
  };

  const cannot = (action: Action) => {
    return !can(action);
  };

  return {
    can,
    cannot,
    openPermissionModal: permissionModalContext?.openPermissionModal || (() => {}),
  };
};

export default usePermission;
