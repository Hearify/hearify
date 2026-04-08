export type Font = {
  family: string;
  url: string;
  options?: FontFaceDescriptors;
};

export type BrandKit = {
  font: Font | null;
  logoUrl: string | null;
  bgColor: string;
  buttonFill: string;
  buttonText: string;
  answerFill: string;
  answerText: string;
};
