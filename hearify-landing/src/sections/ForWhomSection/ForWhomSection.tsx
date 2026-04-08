import React from 'react';
import Carousel from 'nuka-carousel';

import ForWhomCard from '@/containers/ForWhomCard/ForWhomCard';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import styles from './ForWhomSection.module.scss';

type InfoItem = {
  title: string;
  description: string;
};

type ForWhomProps = {
  title: string;
  infoBlocks: InfoItem[];
  icons: React.FC<React.SVGProps<SVGSVGElement>>[];
  links?: string[];
};

const ForWhomSection: React.FC<ForWhomProps> = ({ title, infoBlocks, icons, links = [] }) => {
  const { isDeviceLarge } = useDeviceDetect('md');

  const cards = infoBlocks.map((block, index) => (
    <ForWhomCard
      key={block.title}
      title={block.title}
      description={block.description}
      image={icons[index]}
      link={links[index]}
    />
  ));

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>{title}</h2>
      {isDeviceLarge ? (
        <div className={styles.list}>{cards}</div>
      ) : (
        <Carousel
          className={styles.carousel}
          slidesToShow={1}
          defaultControlsConfig={{
            pagingDotsClassName: styles.dots,
          }}
        >
          {cards}
        </Carousel>
      )}
    </section>
  );
};

export default ForWhomSection;
