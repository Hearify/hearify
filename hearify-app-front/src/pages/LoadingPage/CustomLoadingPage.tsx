import styles from '@src/pages/LoadingPage/LoadingPage.module.scss';

interface LoadingPageProps {
  logo_url: string;
}

const CustomLoadingPage = ({ logo_url }: LoadingPageProps) => {
  return (
    <div className={styles.root}>
      <img className={styles.desktop} src={logo_url} alt="logo" />
      <img className={styles.mobile} src={logo_url} alt="logo" />
    </div>
  );
};

export default CustomLoadingPage;
