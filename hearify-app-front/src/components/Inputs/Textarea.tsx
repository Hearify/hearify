import { useField } from 'formik';

import styles from '@src/components/Inputs/Textarea.module.scss';
import errorIcon from '@src/assets/images/exclamation-circle.svg';

type TextareaProperties = {
  name: string;
  placeholder: string | undefined;
  onChange?: any;
  value?: string;
  disabled?: boolean;
  maxLength?: number;
  style?: Object;
  resize?: boolean;
  isMessage?: boolean;
  switchCase?: any;
};

const Textarea: React.FC<TextareaProperties> = ({ isMessage, maxLength, resize, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <div className={styles.container}>
      <textarea
        className={`${styles.textarea} ${!resize ? styles.resize : ''}`}
        maxLength={maxLength}
        {...props}
        {...field}
      />

      <div className={styles.message_container}>
        {isMessage && meta.touched && meta.error && (
          <div className={styles.message}>
            <img src={errorIcon} /> <p className={styles.form_error}>{meta.error}</p>{' '}
          </div>
        )}
        <p className={meta.touched && meta.error ? styles.error : ''}>{`${field.value?.length}/${maxLength}`}</p>
      </div>
    </div>
  );
};

export default Textarea;
