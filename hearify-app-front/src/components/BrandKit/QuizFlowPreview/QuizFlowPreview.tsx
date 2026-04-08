import React from 'react';

import styles from '@src/components/BrandKit/QuizFlowPreview/QuizFlowPreview.module.scss';
import MultiChoicePreview from '@src/components/BrandKit/QuizFlowPreview/MulitiChoicePreview.tsx';
import HeaderPreview from '@src/components/BrandKit/QuizFlowPreview/HeaderPreview.tsx';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit.tsx';

interface QuizFlowPreviewProps {
  brandKit: BrandKitInterface;
}

const QuizFlowPreview = ({ brandKit }: QuizFlowPreviewProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <HeaderPreview brandKit={brandKit} />
      </div>
      <MultiChoicePreview brandKit={brandKit} />
    </div>
  );
};

export default QuizFlowPreview;
