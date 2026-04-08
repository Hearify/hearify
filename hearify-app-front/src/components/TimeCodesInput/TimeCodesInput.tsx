import { IMask, IMaskInput } from 'react-imask';

interface TimeCodesInputProps {
  value: string;
  disabled?: boolean;
  onComplete: (value: string) => void;
}

const TimeCodesInput = ({ value, onComplete, disabled }: TimeCodesInputProps) => {
  return (
    <IMaskInput
      mask="hh:mm:ss"
      blocks={{
        hh: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 99,
        },
        mm: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 59,
        },
        ss: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 59,
        },
      }}
      onAccept={(value: string) => onComplete(value)}
      unmask
      disabled={disabled}
      value={value}
      placeholder="00:00:00"
      lazy
    />
  );
};

export default TimeCodesInput;
