export function isYoutubeVideoLink(text: string): boolean {
  return new RegExp(
    '(?:https?:\\/\\/)?(?:m\\.|www\\.)?(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v|shorts\\/|watch\\?v=|watch\\?.+&v=))((\\w|-){11})(\\?\\S*)?'
  ).test(text);
}

export const isYoutubeLinkRegExp = new RegExp(
  '(?:https?:\\/\\/)?(?:m\\.|www\\.)?(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v|shorts\\/|watch\\?v=|watch\\?.+&v=))((\\w|-){11})(\\?\\S*)?'
);
