import React, { useEffect, useRef } from 'react';
import cn from 'classnames';

import './AppSelectItem.scss';

import type { AppSelectOption } from '../AppSelect';

export type AppSelectItemProps<T extends string = string> = {
  item: AppSelectOption<T>;
  selected?: boolean;
  active?: boolean;
  readonly?: boolean;
  onClick?: (id: T) => void;
};

function AppSelectItem<T extends string>({
  //
  item,
  selected,
  active,
  readonly,
  onClick = () => {},
}: AppSelectItemProps<T>): React.ReactElement {
  const selectItemRef = useRef<HTMLButtonElement>(null);

  const className = cn(
    'AppSelectItem',
    selected && 'AppSelectItem--selected',
    active && 'AppSelectItem--active',
    readonly && 'AppSelectItem--readonly' //
  );

  // TODO(Sasha): Fix or remove this
  // const scrollToActiveItem = (): void => {
  //   if (!active || !selectItemRef.current) return;
  //   selectItemRef.current.scrollIntoView({
  //     block: 'center',
  //     behavior: 'smooth',
  //   });
  // };
  //
  // const scrollToSelectedItem = (): void => {
  //   if (!selected || !selectItemRef.current) return;
  //   selectItemRef.current.scrollIntoView({
  //     block: 'center',
  //   });
  // };
  //
  // useEffect(scrollToActiveItem, [active]);
  //
  // useEffect(() => {
  //   setTimeout(scrollToSelectedItem, 100);
  // }, []);

  return (
    <button
      type="button"
      ref={selectItemRef}
      className={className}
      onClick={() => onClick(item.id)}
      onPointerDown={(e) => e.preventDefault()}
    >
      {item.title}
    </button>
  );
}

export default AppSelectItem;
