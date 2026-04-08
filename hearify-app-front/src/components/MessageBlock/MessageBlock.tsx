import styles from '@src/components/MessageBlock/MessageBlock.module.scss';
import Button from '../Button/Button';

type MessageBlockProps = {
  children: React.ReactNode;
  image: any;
  style?: {};
  message: string;
  onClick: () => void;
};

const MessageBlock = ({ image, message, onClick, style, children }: MessageBlockProps) => {
  return (
    <div className={styles.container} style={style}>
      <img src={image} alt="Message placeholder icon" />

      <p className={styles.message}>{message}</p>

      <div className={styles.control}>
        <Button
          style="white"
          padding="8px 16px"
          fontSize="16px"
          width="fit-content"
          textColor="#15343a"
          onClick={onClick}
        >
          {children}
        </Button>
      </div>
    </div>
  );
};

export default MessageBlock;
