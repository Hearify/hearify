import React from 'react';
import { useTranslation } from 'next-i18next';

import styles from './ContactUs.module.scss';

type LinkType = {
  name: string;
  link: string;
};

type DataType = {
  title: string;
  description: string;
  links: LinkType[];
};

const ContactUs: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.ContactUs' });

  const data: DataType[] = t('data', { returnObjects: true });

  return (
    <main className={styles.wrapper}>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.description}>{t('description')}</p>
      <ul className={styles.list}>
        {data.map(item => (
          <li key={item.title} className={styles.item}>
            <h2 className={styles.itemTitle}>{item.title}</h2>
            <p className={styles.itemDescription}>{item.description}</p>
            <div className={styles.link}>
              {item.links.map(link => (
                <a key={link.name} href={link.link}>
                  {link.name}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default ContactUs;
