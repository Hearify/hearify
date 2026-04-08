import type React from 'react';
import type { BrandKit } from '@v2/types/brand-kit';

export type FormattedBrandKit = BrandKit & {
  textStyle: React.CSSProperties;
  colorTextStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
  answerTextStyle: React.CSSProperties;
};

const formatBrandKit = (brandKit: BrandKit): FormattedBrandKit => {
  const textStyle = { fontFamily: brandKit?.font?.family && brandKit.font.family };

  const colorTextStyle = {
    color: brandKit.buttonFill,
    fontFamily: brandKit?.font?.family && brandKit.font.family,
  };

  const answerTextStyle = {
    color: brandKit.answerFill,
    fontFamily: brandKit?.font?.family && brandKit.font.family,
  };

  const buttonStyle = {
    bgColor: brandKit?.buttonFill,
    borderColor: brandKit?.buttonFill,
    fontFamily: brandKit?.font?.family && brandKit.font.family,
  };

  return { ...brandKit, colorTextStyle, answerTextStyle, textStyle, buttonStyle };
};

export default formatBrandKit;
