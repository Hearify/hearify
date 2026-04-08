import React from 'react';

import './AppPlaceholder.scss';

export type AppPlaceholderProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  text: string;
};

const AppPlaceholder: React.FC<AppPlaceholderProps> = ({
  icon, //
  text,
  children,
}) => {
  return (
    <div className="AppPlaceholder">
      <div className="AppPlaceholder__icon">{icon}</div>

      <p className="AppPlaceholder__text">{text}</p>

      <div className="AppPlaceholder__body">{children}</div>
    </div>
  );
};

export default AppPlaceholder;
