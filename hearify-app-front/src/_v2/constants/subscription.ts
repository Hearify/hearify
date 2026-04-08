import type { Subscription } from '@v2/types/subscription';

const SANDBOX_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '65e1ef2a68139398fb413e1c',
    name: 'basic',
    billing: 'monthly',
    priceUSD: 7.99,
    priceUAH: 329.99,
    totalUSD: 7.99,
    totalUAH: 329.99,
    priceId: 'pri_01j5nczfdxvekcqr5g4de2mqa1',
  },
  {
    id: '65e1efb268139398fb413e24',
    name: 'premium',
    billing: 'semianually',
    priceUSD: 29.99,
    priceUAH: 1199.99,
    totalUSD: 179.99,
    totalUAH: 7199.99,
    priceId: 'pri_01j5tg4kp72d7mv7n0vwgws6xf',
  },
  {
    id: '66bccd3311b2f506a3e08281',
    name: 'max',
    billing: 'semianually',
    priceUSD: 99.99,
    priceUAH: 3999.99,
    totalUSD: 599.99,
    totalUAH: 23999.99,
    priceId: 'pri_01j5tg6a3jz18nt4aj3xnaev5q',
  },
];

const PROD_SUBSCRIPTION: Subscription[] = [
  {
    id: '65e1ee2768139398fb413e1a',
    name: 'basic',
    billing: 'monthly',
    priceUSD: 7.99,
    priceUAH: 329.99,
    totalUSD: 7.99,
    totalUAH: 329.99,
    priceId: 'pri_01j62d3trkkp9cdc4z9p5d3s9c',
  },
  {
    id: '65e1ef2a68139398fb413e1c',
    name: 'premium',
    billing: 'semianually',
    priceUSD: 29.99,
    priceUAH: 1199.99,
    totalUSD: 179.99,
    totalUAH: 7199.99,
    priceId: 'pri_01j5n3c3ckqcta5jkjf767cttm',
  },
  {
    id: '65e1efb268139398fb413e24',
    name: 'max',
    billing: 'semianually',
    priceUSD: 99.99,
    priceUAH: 3999.99,
    totalUSD: 599.99,
    totalUAH: 23999.99,
    priceId: 'pri_01j5n3gr019g7mr2v9ydrd5wx3',
  },
];

// eslint-disable-next-line import/prefer-default-export
export const SUBSCRIPTIONS: Subscription[] =
  import.meta.env.VITE_PADDLE_ENV === 'production' ? PROD_SUBSCRIPTION : SANDBOX_SUBSCRIPTIONS;
