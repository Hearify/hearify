export type SubscriptionName = 'free' | 'basic' | 'premium' | 'max';

export type SubscriptionBilling = 'semianually' | 'monthly';

export type Subscription = {
  id: string;
  name: SubscriptionName;
  billing?: SubscriptionBilling;
  priceId: string;
  priceUSD: number;
  priceUAH: number;
  totalUSD: number;
  totalUAH: number;
};
