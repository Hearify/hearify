import React, { useEffect, useRef, useState } from 'react';

import styles from './FAQBlock.module.scss';

export type FAQBlockProps = {
  question: string;
  answer: string;
};

const FAQBlock: React.FC<FAQBlockProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const answerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!answerRef.current) return;
    answerRef.current.style.maxHeight = isOpen ? `${answerRef.current.scrollHeight}px` : '';
  }, [isOpen]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus
    <div className={styles.wrapper} role="button" onClick={handleClick}>
      <div className={styles.question}>
        <span>{question}</span>
        <span className={styles.sign}>{isOpen ? '-' : '+'}</span>
      </div>
      <div className={styles.answer} ref={answerRef}>
        <p>{answer}</p>
      </div>
    </div>
  );
};

export default FAQBlock;
