import { useImperativeHandle, useState } from 'react';

export default function useModal(ref: any, opened = false, onOpen?: () => any, onClose?: () => any, data = {}) {
  const [_opened, _setOpened] = useState(opened);
  const [_data, setData] = useState(data);

  const setOpened = (bOpened: any) => {
    bOpened ? onOpen && onOpen() : onClose && onClose();

    _setOpened(bOpened);
  };

  const toggleOpened = () => setOpened(!_opened);

  const imperativeHandles = {
    setOpened,
    toggleOpened,
    setData,
    getOpened() {
      return opened;
    },
  };

  const handleOutSideMouseDown = (event: any, containerRef: any) => {
    if (containerRef.current.contains(event.target)) {
      return;
    }

    setOpened(false);
  };

  useImperativeHandle(ref, () => imperativeHandles);

  return {
    opened: _opened,
    setOpened,
    toggleOpened,
    data: _data,
    setData,
    imperativeHandles,
    handleOutSideMouseDown,
  };
}
