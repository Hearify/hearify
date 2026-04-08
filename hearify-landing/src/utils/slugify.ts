import slugifyLib from 'slugify';

const slugify = (text: string): string => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
  });
};

export default slugify;
