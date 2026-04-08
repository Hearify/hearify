import React, { useState, useCallback, createContext } from 'react';

import PermissionModal from '@v2/containers/PermissionModal/PermissionModal';

import type { Action } from '@v2/types/action';

type PermissionModalContextType = {
  openPermissionModal: (action: Action, onClose?: () => void) => void;
};

export const PermissionModalContext = createContext<PermissionModalContextType | undefined>(undefined);

type PermissionModalProviderProps = {
  children: React.ReactNode;
};

export const PermissionModalProvider: React.FC<PermissionModalProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<Action>('choose-quiz-options');
  const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | undefined>();

  const openPermissionModal = useCallback((action: Action, onClose?: () => void) => {
    setModalAction(action);
    setOnCloseCallback(() => onClose);
    setIsModalOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsModalOpen(false);
    onCloseCallback?.();
  }, [onCloseCallback]);

  return (
    <PermissionModalContext.Provider value={{ openPermissionModal }}>
      {children}
      <PermissionModal
        visible={isModalOpen}
        onSkip={onClose}
        onClose={() => setIsModalOpen(false)}
        action={modalAction}
      />
    </PermissionModalContext.Provider>
  );
};
