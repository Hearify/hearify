import ChevronDownIcon from '@v2/assets/icons/chevron-down.svg';
import ChevronUpIcon from '@v2/assets/icons/chevron-up.svg';
import ChevronRightIcon from '@v2/assets/icons/chevron-right.svg';
import ChevronLeftIcon from '@v2/assets/icons/chevron-left.svg';
import EnvelopeIcon from '@v2/assets/icons/envelope.svg';
import CloseIcon from '@v2/assets/icons/close.svg';
import CheckCircleIcon from '@v2/assets/icons/check-circle.svg';

// eslint-disable-next-line import/prefer-default-export
export const iconMap = {
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-left': ChevronLeftIcon,
  envelope: EnvelopeIcon,
  close: CloseIcon,
  'check-circle': CheckCircleIcon,
} as const;
