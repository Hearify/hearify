import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

import styles from './DesktopPlans.module.scss';
import EnvelopeIcon from '@/assets/icons/envelope.svg';

const CustomPlan: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.customPlan' });
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('/api/send-custom-plan', {
        name,
        email,
        description,
      });
      toast.success(t('successMessage'));
      setName('');
      setEmail('');
      setDescription('');
    } catch (error: unknown) {
      console.error(error);
      toast.error(t('errorMessage'));
    }
  };

  return (
    <div className={styles['custom-plan']}>
      <div className={styles['general-info']}>
        <p className={styles.title}>{t('title')}</p>
        <p className={styles.price}>{t('price')}</p>
        <p className={styles.description}>{t('description')}</p>
      </div>
      <form className={styles['form-container']} onSubmit={handleSubmit}>
        <div className={styles['name-email-inputs']}>
          <div className={styles['input-container']}>
            <p className={styles.label}>{t('nameLabel')}</p>
            <input
              type="text"
              className={styles.input}
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className={styles['input-container']}>
            <p className={styles.label}>{t('emailLabel')}</p>
            <input
              type="email"
              className={styles.input}
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className={styles['input-container']}>
          <p className={styles.label}>{t('requirementsLabel')}</p>
          <textarea
            className={`${styles.input} ${styles['description-textarea']}`}
            placeholder={t('requirementsPlaceholder')}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className={styles['btn-container']}>
          <button type="submit" className={styles.btn}>
            <EnvelopeIcon width={22} height={22} />
            {t('button')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPlan;
