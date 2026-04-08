import React from 'react';
import { CSSTransition } from 'react-transition-group';

import AppIcon from '@v2/components/AppIcon/AppIcon';
import useNoScroll from '@v2/hooks/useNoScroll';
import './AppModal.scss';

interface AppModalProps {
  visible: boolean;
  width?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const AppModal: React.FC<AppModalProps> = ({ visible, width = '600px', onClose, children }) => {
  useNoScroll(visible);

  return (
    <CSSTransition in={visible} timeout={300} unmountOnExit className="AppModal__backgrop">
      <div className="AppModal__backdrop" onPointerDown={onClose}>
        <div className="AppModal" style={{ width }} onPointerDown={(e) => e.stopPropagation()}>
          <AppIcon name="close" className="AppModal__icon" onClick={onClose} />

          {children}
        </div>
      </div>
    </CSSTransition>
  );
};

export default AppModal;
