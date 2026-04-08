import React from 'react';
import { useField } from 'formik';

import checkedBoxIcon from '@src/assets/images/Checkbox.svg';
import uncheckedBoxIcon from '@src/assets/images/uncheckedBox.svg';
import styles from './CustomCheckbox.module.scss';

const CustomCheckbox = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label>
        <input type="checkbox" {...field} {...props} className={styles.hiddenCheckbox} />
        <img
          src={field.value ? checkedBoxIcon : uncheckedBoxIcon}
          alt="checkbox"
          className={styles.customCheckboxIcon}
        />
        <div>{label}</div>
      </label>
      {meta.touched && meta.error ? <p className={styles.error}>{meta.error}</p> : null}
    </>
  );
};

export default CustomCheckbox;
