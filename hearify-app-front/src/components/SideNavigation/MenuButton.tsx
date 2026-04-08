import '@src/components/SideNavigation/MenuButton.scss';

interface MenuButtonProps {
  icon: string;
  text: string;
  isSelected: boolean;
  arrow?: string;
  onClick?: () => void;
}

const MenuButton = ({ icon, text, isSelected, arrow, onClick }: MenuButtonProps) => {
  return (
    <div
      className={isSelected ? 'selected-button selected-button-text' : 'button button-text'}
      onClick={() => onClick && onClick()}
    >
      <img src={icon} alt="" />
      {text}
      <img className="arrow-of-extending animated-image" src={arrow} />
    </div>
  );
};

export default MenuButton;
