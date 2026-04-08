const HEADER_REGEX = /^(#{2})\s+(.+)$/gm;

const extractHeaders = (content: string): string[] => {
  return Array.from(content.matchAll(HEADER_REGEX)).map(match => match[2]);
};

export default extractHeaders;
