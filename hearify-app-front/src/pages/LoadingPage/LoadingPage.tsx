import styles from '@src/pages/LoadingPage/LoadingPage.module.scss';
import logo from '@src/assets/images/logo.svg';

const LoadingPage = () => {
  return (
    <div className={styles.root}>
      <img className={styles.desktop} src={logo} alt="logo" width={540} />
      <img className={styles.mobile} src={logo} alt="logo" width={265} />
    </div>
  );
};

export default LoadingPage;
