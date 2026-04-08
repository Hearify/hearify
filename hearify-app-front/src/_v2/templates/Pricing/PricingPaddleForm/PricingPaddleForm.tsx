import React, { useEffect } from 'react';
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';

import { useAuthStore } from '@src/store/auth';

import type { InitializePaddleOptions, PaddleEventData } from '@paddle/paddle-js';

export type PricingPaddleFormProps = {
  priceId: string;
  onSuccess: (orderId: string) => void;
  onError: () => void;
};

const PricingPaddleForm: React.FC<PricingPaddleFormProps> = ({
  priceId, //
  onSuccess,
  onError,
}) => {
  const user = useAuthStore((state) => state.user);

  const handlePaddleEvent = (event: PaddleEventData) => {
    if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
      onSuccess(String(event.data?.transaction_id));
    } else if (event.name === CheckoutEventNames.CHECKOUT_FAILED) {
      onError();
    }
  };

  const paddleConfig: InitializePaddleOptions = {
    pwCustomer: {
      email: user?.email,
      id: String(user?.id),
    },

    environment: import.meta.env.VITE_PADDLE_ENV,
    token: import.meta.env.VITE_PADDLE_TOKEN,
    eventCallback: handlePaddleEvent,
    checkout: {
      settings: {
        displayMode: 'inline',
        frameTarget: 'paddle-form-container',
        frameInitialHeight: 450,
        frameStyle: 'width: 100%;',
      },
    },
  };

  useEffect(() => {
    initializePaddle(paddleConfig).then((paddleInstance) => {
      if (!paddleInstance) return;

      paddleInstance.Checkout.open({
        items: [{ priceId }],
        customer: {
          email: String(user?.email),
        },
      });
    });
  }, []);

  return <div className="paddle-form-container" />;
};

export default PricingPaddleForm;
