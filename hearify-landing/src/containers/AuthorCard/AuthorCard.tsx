import React from 'react';
import Image from 'next/image';

import LinkedInIcon from '@/assets/icons/linkedin.svg';
import { AuthorRoleEnum } from '@/types/author';
import styles from './AuthorCard.module.scss';

import type { Author, AuthorRole } from '@/types/author';

export type AuthorCardProps = {
  author: Author;
  role: AuthorRole;
};

const AuthorCard: React.FC<AuthorCardProps> = ({ author, role }) => {
  return (
    <div className={styles.wrapper}>
      {role === 'author' ? (
        <a href={author.linkedInUrl} target="_blank" rel="noreferrer" className={styles.avatar}>
          <Image src={author.avatarUrl} alt={author.name} width={100} height={100} className={styles.avatarImage} />
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <LinkedInIcon width={32} height={32} className={styles.avatarIcon} />
        </a>
      ) : (
        <div className={styles.avatar}>
          <Image src={author.avatarUrl} alt={author.name} width={100} height={100} className={styles.avatarImage} />
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.name}>{author.name}</span>

          <div className={styles.body}>
            <p className={styles.role}>{AuthorRoleEnum[role]}</p>
          </div>
        </div>
        <p className={styles.description}>{author.description}</p>
      </div>
    </div>
  );
};

export default AuthorCard;
