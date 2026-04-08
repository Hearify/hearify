import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './UploadFileInput.module.scss';
import uploadIcon from '../../assets/images/photo.png';
import clearIcon from '../../assets/images/x-mark.png';

interface UploadFileInputProps {
  handleSetImage: (arg: File | null) => void;
  resetFileInput: boolean;
  clearPreset: () => void;
}

const UploadFileInput = ({ handleSetImage, resetFileInput, clearPreset }: UploadFileInputProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation('general');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileValidation = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File size should not exceed ${MAX_FILE_SIZE_MB} MB.`);
      setSelectedFile(null);
      handleSetImage(null);
      clearPreset();
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && handleFileValidation(file)) {
      setSelectedFile(file);
      handleSetImage(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (handleFileValidation(file)) {
        setSelectedFile(file);
        handleSetImage(file);
      } else {
        setSelectedFile(null);
      }
    }
  };

  const clearUserFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedFile(null);
    handleSetImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleDivClick();
    }
  };

  useEffect(() => {
    if (resetFileInput) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resetFileInput]);

  return (
    <div>
      <div
        className={styles.input}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDivClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <img src={uploadIcon} alt="Upload icon" className={styles.upload_icon} />
        <input
          ref={fileInputRef}
          id="fileInput"
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/svg"
          onChange={handleFileChange}
          className={styles.fileInput}
          style={{ display: 'none' }}
        />
        <div className={styles.input_text}>
          <p className={styles.file_name}>
            {selectedFile ? (
              <div className={styles.file_container}>
                <span>Uploaded: {selectedFile.name}</span>
                <button onClick={clearUserFile} type="button">
                  <img src={clearIcon} alt="Clear icon" />
                </button>
              </div>
            ) : (
              <>{t('drop_your_image')}</>
            )}
          </p>
          {errorMessage ? (
            <>
              <p className={styles.file_size}>{t('upload_limits')}</p>
              <p className={styles.error}>{errorMessage}</p>
            </>
          ) : (
            <div className={styles.upload_info}>
              <p className={styles.file_size}>{t('upload_limits')}</p>
              <p className={styles.file_size}>{t('file_size_limit')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFileInput;
