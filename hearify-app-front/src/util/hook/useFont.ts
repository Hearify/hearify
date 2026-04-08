export interface Font {
  family: string;
  url: string;
  options?: any;
}

const useFont = (font: Font) => {
  const fontFace = new FontFace(font.family, font.url, font.options);

  const loadFontFace = async (fontFace: FontFace) => {
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
  };

  loadFontFace(fontFace);
};

export { useFont };
