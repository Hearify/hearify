import { useField } from 'formik';

import errorIcon from '@src/assets/images/exclamation-circle.svg';
import styles from './CustomInput.module.scss';

type InputProps = {
  label?: string;
  placeholder?: string;
  name: string;
  type?: string;
  value?: string;
  multiple?: boolean;
  style?: Object;
  disabled?: boolean;
  isMessage?: boolean;
  validate?: (value: any) => undefined | string | Promise<any>;
  onKeyDown?: (e: any) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const CustomInput = ({ label, isMessage, disabled, onClick, onChange, ...props }: InputProps) => {
  const [field, meta] = useField(props);

  return (
    <div className={styles.container}>
      {meta.touched && meta.error && !disabled && (
        <img src={errorIcon} className={label ? styles.error_icon_label : styles.error_icon} alt="error icon" />
      )}
      {label && <label htmlFor={props.name}>{label}</label>}
      <input
        {...field}
        {...props}
        readOnly={disabled}
        onClick={onClick}
        onChange={onChange || field.onChange}
        className={meta.touched && meta.error ? styles.error : ''}
      />
      {isMessage && meta.touched && meta.error && <p className={styles.form_error}>{meta.error}</p>}
    </div>
  );
};
