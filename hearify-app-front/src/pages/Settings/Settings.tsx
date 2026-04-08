import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import brandKitActive from '@src/assets/images/brand-kit-active.svg';
import brandKitDeactive from '@src/assets/images/brand-kit-deactive.svg';
import accountInfoActive from '@src/assets/images/account-info-active.svg';
import accountInfoDeactive from '@src/assets/images/account-info-deactive.svg';
import UserInformation from '@src/components/UserInformation/UserInformation';
import ChangePassword from '@src/components/ChangePassword/ChangePassword';
import Privacy from '@src/components/Privacy/Privacy';
import BrandKit from '@src/components/BrandKit/BrandKit';
import styles from './Settings.module.scss';

enum SettingsChoices {
  AccountInfo,
  BrandKit,
}

const Settings = () => {
  const { t } = useTranslation('general');
  const [settingsChoice, setSettingsChoice] = useState(SettingsChoices.AccountInfo);
  const handleAccountInfoClick = () => {
    if (!(settingsChoice === SettingsChoices.AccountInfo)) {
      setSettingsChoice(SettingsChoices.AccountInfo);
    }
  };

  const handleBrandKitClick = () => {
    if (!(settingsChoice === SettingsChoices.BrandKit)) {
      setSettingsChoice(SettingsChoices.BrandKit);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.settings}>
        <h1 className={styles.headerText}>{t('settings')}</h1>

        <div className={styles.settingsChoicesContainer}>
          <div
            id="accountInfo"
            className={styles.settingsChoice}
            onClick={handleAccountInfoClick}
            style={
              settingsChoice === SettingsChoices.AccountInfo
                ? { borderBottom: '3px solid #4E30D2' }
                : { borderBottom: 'none' }
            }
          >
            <img src={settingsChoice === SettingsChoices.AccountInfo ? accountInfoActive : accountInfoDeactive} />
            <p style={settingsChoice === SettingsChoices.AccountInfo ? { color: '#6444F4FF' } : { color: '#475569' }}>
              {t('account_info')}
            </p>
          </div>
          <div
            id="brandKit"
            className={styles.settingsChoice}
            onClick={handleBrandKitClick}
            style={
              settingsChoice === SettingsChoices.BrandKit
                ? { borderBottom: '3px solid #4E30D2' }
                : { borderBottom: 'none' }
            }
          >
            <img src={settingsChoice === SettingsChoices.BrandKit ? brandKitActive : brandKitDeactive} />
            <p style={settingsChoice === SettingsChoices.BrandKit ? { color: '#6444F4FF' } : { color: '#475569' }}>
              {t('brand_kit')}
            </p>
          </div>
        </div>

        {settingsChoice === SettingsChoices.AccountInfo && (
          <div className={styles.settingsContainer}>
            <UserInformation />
            <ChangePassword />
            <Privacy />
          </div>
        )}
        {settingsChoice === SettingsChoices.BrandKit && <BrandKit />}
      </div>
    </section>
  );
};

export default Settings;
