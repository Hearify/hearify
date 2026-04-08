import { forwardRef, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@src/pages/NewQuiz/NewQuiz.module.scss';
import { errorToast } from '@src/toasts/toasts';
import uploadIcon from '@src/assets/images/upload.svg';
import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';

type UploadProps = {
  file: any;
  handleChange: (v?: any) => void;
};

const Upload = forwardRef<HTMLInputElement, UploadProps>(({ file, handleChange }, ref) => {
  const { t } = useTranslation('general');
  const dragoverRef = useRef<HTMLDivElement>(null);

  const upload = () => {
    // @ts-ignore
    ref?.current?.click();
  };

  const handleFileChange = (event: any) => {
    const path = event.target.value.split('.');
    const extension = `${path[path.length - 1]}`;

    if (extension === 'pdf' || extension == 'docx') {
      handleChange(event.target?.files[0]);
    } else {
      TrackingAPI.trackEvent('upload_file_attempt', {
        status: 'fail',
        file_type: 'pdf',
      });

      errorToast('Wrong type of file, try .pdf or .docx');
      event.target.value = '';
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const { files } = e.dataTransfer;

    if (
      files &&
      files.length &&
      (files[0].type === 'application/pdf' ||
        files[0].type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      handleChange(files[0]);
    } else {
      TrackingAPI.trackEvent('upload_file_attempt', {
        status: 'fail',
        file_type: 'pdf',
      });

      errorToast(t('wrong_type'));
    }
  };

  useEffect(() => {
    // @ts-ignore
    dragoverRef?.current?.addEventListener('dragover', handleDragOver);
    // @ts-ignore
    dragoverRef?.current?.addEventListener('drop', handleDrop);

    return () => {
      // @ts-ignore
      dragoverRef?.current?.removeEventListener('dragover', handleDragOver);
      // @ts-ignore
      dragoverRef?.current?.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div ref={dragoverRef} className={styles.upload} onClick={upload}>
      <p className={styles.title}>{t('choose_file')}</p>

      <img src={uploadIcon} alt="upload" />

      {file ? (
        <p className={styles.description} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
          {file.name}
        </p>
      ) : (
        <p className={styles.description}>{t('drag_upload')}</p>
      )}

      <input
        ref={ref}
        onChange={handleFileChange}
        type="file"
        accept="application/pdf, .docx"
        style={{ display: 'none' }}
      />
    </div>
  );
});

export default Upload;
