import React from 'react';
import { CheckIcon, CalendarIcon } from '@heroicons/react/24/solid';

import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import InfoBoardCard from '@/containers/InfoBoardCard/InfoBoardCard';
import styles from './InfoBoardSection.module.scss';

type InfoBoardProps = {
  title: string;
  description: string;
  text_list: string[];
  button?: string;
  showButtonIcon?: boolean;
  wrapperStyle?: 'wrapper1' | 'wrapper2' | 'wrapper3';
  backImg?: React.FC<React.SVGProps<SVGSVGElement>>;
};

const InfoBoardSection: React.FC<InfoBoardProps> = ({
  title,
  description,
  text_list,
  button = '',
  showButtonIcon = false,
  wrapperStyle = 'wrapper3',
  backImg: BackImageComponent = undefined,
}) => {
  return (
    <section className={styles[wrapperStyle]}>
      {BackImageComponent && wrapperStyle !== 'wrapper3' && (
        <BackImageComponent
          className={styles[`imageBack${wrapperStyle === 'wrapper1' ? '1' : '2'}`]}
          width={554}
          height={554}
        />
      )}

      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.content}>
          {text_list.map(text => (
            <InfoBoardCard key={text} text={text} image={CheckIcon} />
          ))}
        </div>

        {button && (
          <AppButtonLink className={styles.button} href="https://app.hearify.org/signup" size="lg">
            {button}
            {showButtonIcon && <CalendarIcon />}
          </AppButtonLink>
        )}
      </div>
    </section>
  );
};

export default InfoBoardSection;
