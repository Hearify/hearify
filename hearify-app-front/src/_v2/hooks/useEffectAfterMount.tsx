import { useEffect, useRef } from 'react';

import type React from 'react';

const useEffectAfterMount = (func: () => void, deps?: React.DependencyList) => {
  const didMount = useRef<boolean>(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};

export default useEffectAfterMount;
