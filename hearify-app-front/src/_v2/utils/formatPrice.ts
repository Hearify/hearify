// TODO(Sasha): Think how to move i18n to v2;
import i18n from '@src/util/i18n';

const formatPrice = (price: number): string => {
  const currency = i18n.language === 'en' ? 'USD' : 'UAH';

  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(price);
};

export default formatPrice;
