import client from '../client';

import type * as I from './PaymentAPI.types';

class PaymentAPI {
  public static connectSubscription = async (orderId: string): Promise<void> => {
    // TODO(Sasha): Figure out how to get rid of this timeout
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    await client.post<I.ConnectSubscriptionRequest, I.ConnectSubscriptionResponse>(
      '/api/subscription/connect',
      undefined,
      {
        params: {
          order_id: orderId,
        },
      }
    );
  };
}

export default PaymentAPI;
