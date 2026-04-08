import React from 'react';

import styles from './FAQSection.module.scss';
import FAQBlock from '@/containers/FAQBlock/FAQBlock';
import FAQSchema from '@/containers/FAQSchema/FAQSchema';

import type { FAQItem } from '@/types/article';

type FAQProps = {
  title: string;
  faqBlocks: FAQItem[];
};

const FAQSection: React.FC<FAQProps> = ({ title, faqBlocks }) => {
  return (
    <section className={styles.wrapper} id="faq">
      <FAQSchema items={faqBlocks} />

      <h2 className={styles.title}>{title}</h2>
      <div className={styles.list}>
        {faqBlocks.map(item => (
          <FAQBlock key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
