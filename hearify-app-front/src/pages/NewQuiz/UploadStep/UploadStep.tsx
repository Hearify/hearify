import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import cn from 'classnames';
import { all } from 'axios';

import AppAutocomplete from '@v2/components/AppAutocomplete/AppAutocomplete';
import Upload from '@src/components/Upload/Upload';
import { Button } from '@src/components/Button/Button';
import documentIcon from '@src/assets/images/document.svg';
import filmIcon from '@src/assets/images/film.svg';
import sparklesIcon from '@src/assets/images/sparkles.svg';
import resultsIcon from '@src/assets/images/result.svg';
import { isYoutubeLinkRegExp } from '@src/util/validator/isYoutubeVideoLink';
import { LANGUAGES } from '@src/constants';
import styles from './UploadStep.module.scss';

import type { SubmitHandler } from 'react-hook-form';
import type { QuizGenerationType } from '@v2/types/quiz';
import type { GenerationType } from '@v2/api/GenerationAPI/GenerationAPI.types';

export type UploadStepForm = {
  youtube?: string;
  prompt?: string;
  file?: File;
  language: string;
};

export type UploadStepProps = {
  onNextClick: (values: UploadStepForm, type: QuizGenerationType) => void;
  loadStorage?: boolean;
  loading?: boolean;
};

/* eslint-disable react/jsx-props-no-spreading */
const UploadStep: React.FC<UploadStepProps> = ({ loading, onNextClick, loadStorage }) => {
  const { t } = useTranslation('general');

  const uploadRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { icon: documentIcon, key: 'file', name: t('file') },
    { icon: filmIcon, key: 'youtube', name: 'Youtube' },
    { icon: resultsIcon, key: 'text', name: t('text') },
  ] as const;

  const [activeTab, setActiveTab] = useState<GenerationType>('file');

  const { register, handleSubmit, reset, control, formState, watch } = useForm<UploadStepForm>({
    mode: 'onChange',
    defaultValues: {
      language: 'Auto',
    },
  });

  const { isDirty, isValid, errors } = formState;

  const allFields = watch();

  const changeTab = (value: GenerationType) => {
    reset({
      language: allFields.language,
    });
    localStorage.removeItem('uploadStep');
    localStorage.removeItem('uploadStepTab');
    setActiveTab(value);
  };

  const onSubmit: SubmitHandler<UploadStepForm> = (values) => {
    onNextClick(values, activeTab);
  };

  useEffect(() => {
    if (!allFields.youtube && !allFields.file && !allFields.prompt && allFields.language === 'Auto') return;
    if (activeTab === 'file') return;

    localStorage.setItem('uploadStep', JSON.stringify(allFields));
    localStorage.setItem('uploadStepTab', activeTab);
  }, [allFields]);

  useEffect(() => {
    if (!loadStorage) return;

    const savedFields = localStorage.getItem('uploadStep');
    const savedTab = localStorage.getItem('uploadStepTab');

    if (savedFields) reset(JSON.parse(savedFields) as UploadStepForm, { keepDefaultValues: true });
    if (savedTab) setActiveTab(savedTab as GenerationType);
  }, [loadStorage]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{t('what_to_use_for_quiz')}</p>

      <div className={styles.container}>
        <p className={styles.subtitle}>{t('choose_material')}</p>

        <div className={styles.tabList}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(styles.tab, activeTab === tab.key && styles.tabActive)}
              onClick={() => changeTab(tab.key)}
            >
              <img src={tab.icon} alt={tab.name} />
              {tab.name}
            </button>
          ))}
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {activeTab === 'file' && (
            <Controller
              control={control}
              name="file"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Upload ref={uploadRef} file={value} handleChange={onChange} />
              )}
            />
          )}

          {activeTab === 'youtube' && (
            <>
              <input
                className={cn(styles.input, errors.youtube && styles.error)}
                type="url"
                {...register('youtube', {
                  pattern: {
                    value: isYoutubeLinkRegExp,
                    message: t('invalid_youtube_link'),
                  },
                  required: t('required_field'),
                })}
                placeholder="https://www.youtube.com/watch?v=aBCdefG1234"
              />

              {errors.youtube && <p className={styles.errorText}>{errors.youtube?.message}</p>}
            </>
          )}

          {activeTab === 'text' && (
            <div className={styles.textareaContainer}>
              <textarea
                className={cn(styles.textarea, errors.prompt && styles.error)}
                placeholder={t('add_quiz_topic')}
                {...register('prompt', {
                  minLength: {
                    value: 50,
                    message: t('prompt_too_short'),
                  },
                  maxLength: {
                    value: 10000,
                    message: t('prompt_too_long'),
                  },
                  required: t('required_field'),
                })}
              />
              <Controller
                control={control}
                name="prompt"
                render={({ field: { value } }) => (
                  <p className={cn(styles.textareaText, errors.prompt && styles.errorText)}>
                    {`${value?.length ?? 0}/${10000}`}
                  </p>
                )}
              />

              {errors.prompt && <p className={styles.errorText}>{errors.prompt?.message}</p>}
            </div>
          )}

          <div className={styles.footer}>
            <p className={styles.subtitle}>{t('choose_language')}</p>

            <Controller
              control={control}
              name="language"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <AppAutocomplete
                  options={LANGUAGES.map((item) => ({
                    id: item.key,
                    title: item.name,
                  }))}
                  onSelect={onChange}
                  value={value}
                />
              )}
            />
          </div>

          <Button
            style="purple"
            width="270px"
            fontSize="20px"
            padding="12px 20px"
            disabled={!isDirty || !isValid}
            isLoading={loading}
          >
            <img src={sparklesIcon} alt="Sparkles icon" />
            {t('next').toUpperCase()}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadStep;
