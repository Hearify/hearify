import Image from 'next/image';
import { CalendarIcon } from '@heroicons/react/24/solid';

import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import styles from './HeroSection.module.scss';

import type { StaticImageData } from 'next/image';

type HeroProps = {
  title: string;
  description: string;
  button: string;
  image: StaticImageData;
};

const HeroSection: React.FC<HeroProps> = ({ title, description, button, image }) => {
  return (
    <section className={styles.wrapper} id="hero">
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <AppButtonLink className={styles.button} href="https://app.hearify.org/signup" size="lg">
        {button}
        <CalendarIcon />
      </AppButtonLink>
      <div>
        <Image
          className={styles.img}
          src={image}
          alt="Hero image"
          width={590}
          height={360}
          fetchPriority="high"
          priority
        />
      </div>
    </section>
  );
};

export default HeroSection;
