import { DISALLOWED_INPUT_SYMBOLS } from '@src/constants';

import type { KeyboardEvent } from 'react';

export const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  if (DISALLOWED_INPUT_SYMBOLS.includes(e.key)) {
    e.preventDefault();
  }
};

// export const handleBlur = () => {
//   if (!quantity) {
//     setQuantity(1);
//   }
// };
