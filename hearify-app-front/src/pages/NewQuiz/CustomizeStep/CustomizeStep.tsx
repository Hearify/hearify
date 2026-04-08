import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import cn from 'classnames';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

import styles from './CustomizeStep.module.scss';
import { useAuthStore } from '@src/store/auth';
import TimeCodesInput from '@src/components/TimeCodesInput/TimeCodesInput';
import Switch from '@src/components/Switch/Switch';
import { DIFFICULTY } from '@src/constants';
import { handleKeyDown } from '@src/util/input';
import { Button } from '@src/components/Button/Button';
import arrowIcon from '@src/assets/images/back-arrow.svg';
import sparklesIcon from '@src/assets/images/sparkles.svg';
import AppSelect from '@v2/components/AppSelect/AppSelect';
import useEffectAfterMount from '@v2/hooks/useEffectAfterMount';
import usePermission from '@v2/hooks/usePermission';

import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { GenerationType } from '@v2/api/GenerationAPI/GenerationAPI.types';

type Range = {
  from: string;
  to: string;
};

type Auto = {
  range: boolean;
  difficulty: boolean;
  questions: boolean;
  prompt: boolean;
};

export type CustomizeStepForm = {
  from: string;
  to: string;
  difficulty: string;
  singleChoice: string;
  multiChoice: string;
  matching: string;
  fillIn: string;
  open: string;
  prompt: string;
};

export type CustomizeStepProps = {
  type: GenerationType;
  onGenerateClick: (values: CustomizeStepForm) => void;
  onBackClick: () => void;
  timeCodes?: Range | null;
};

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */
const CustomizeStep: FC<CustomizeStepProps> = ({ type, onGenerateClick, onBackClick, timeCodes }) => {
  const { t } = useTranslation('general');

  const { can, cannot, openPermissionModal } = usePermission();

  const { subscription } = useAuthStore((state) => state);

  const [auto, setAuto] = useState<Auto>({ range: false, difficulty: false, questions: false, prompt: false });

  const { register, watch, handleSubmit, reset, control, formState, getValues, trigger } = useForm<CustomizeStepForm>({
    mode: 'onChange',
    defaultValues: {
      prompt: '',
      from: type === 'file' ? '1' : (timeCodes?.from ?? '00:00:00'),
      to: type === 'file' ? '10' : (timeCodes?.to ?? '00:10:00'),
      difficulty: 'auto',
      singleChoice: '5',
      multiChoice: '0',
      matching: '0',
      fillIn: '0',
      open: '0',
    },
  });

  const { range, difficulty, questions, prompt } = auto;

  const { isValid, errors } = formState;

  const watchFields = watch(['singleChoice', 'multiChoice', 'matching', 'fillIn', 'open']);
  const allFields = watch();

  // TODO(Sasha): Rewrite this totalQuestions and maxNumberOfQuestions code
  const totalQuestions = useMemo<number>(() => {
    return Object.values(watchFields).reduce((acc, value) => acc + Number(value), 0);
  }, [watchFields]);

  const maxNumberOfQuestions = useMemo<number>(() => {
    if (!subscription) return 5;
    if (subscription.name === 'basic') return 10;
    if (subscription.name === 'premium') return 30;
    if (subscription.name === 'max') return 10000;
    return 5;
  }, [subscription]);

  const onSubmit: SubmitHandler<CustomizeStepForm> = (data) => {
    const isDirtyFields = Object.values(formState.dirtyFields).find((field) => field);

    if (cannot('choose-quiz-options') && isDirtyFields) {
      openPermissionModal('choose-quiz-options');
      return;
    }

    if (maxNumberOfQuestions < totalQuestions) {
      openPermissionModal('choose-quiz-options');
      return;
    }

    onGenerateClick(data);
  };

  const handleAutoChange = (value: boolean, key: string) => {
    setAuto((prev) => ({ ...prev, [`${key}`]: value }));
  };

  useEffect(() => {
    if (auto.range) {
      reset({
        ...getValues(),
        from: type === 'file' ? '1' : (timeCodes?.from ?? '00:00:00'),
        to: type === 'file' ? '10' : (timeCodes?.to ?? '00:10:00'),
      });
    }
    if (auto.difficulty) {
      reset({ ...getValues(), difficulty: 'auto' });
    }
    if (auto.questions) {
      reset({ ...getValues(), singleChoice: '5', multiChoice: '0', matching: '0', fillIn: '0', open: '0' });
    }
    if (auto.prompt) {
      reset({ ...getValues(), prompt: '' });
    }
  }, [auto]);

  useEffectAfterMount(() => {
    if (type === 'file') return;

    localStorage.setItem('customizeStepAuto', JSON.stringify(auto));
    localStorage.setItem('customizeStep', JSON.stringify(allFields));
  }, [allFields, auto]);

  useEffect(() => {
    const storage = localStorage.getItem('customizeStep');
    const storageAuto = localStorage.getItem('customizeStepAuto');

    if (storage) {
      const data = JSON.parse(storage) as CustomizeStepForm;
      reset(data, { keepDefaultValues: true });
    } else if (type !== 'file') {
      localStorage.setItem('customizeStep', JSON.stringify(getValues()));
    }

    if (storageAuto) {
      const data = JSON.parse(storageAuto) as Auto;
      setAuto(data);
    } else if (type !== 'file') {
      localStorage.setItem('customizeStepAuto', JSON.stringify(auto));
    }
  }, []);

  useEffect(() => {
    trigger();
  }, []);

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{t('customize_your_quiz')}</p>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {type === 'youtube' && (
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.label}>
                <p className={styles.subtitle}>{t('choose_time_codes')}</p>
                {cannot('choose-quiz-options') ? (
                  <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
                ) : (
                  <LockOpenIcon />
                )}
              </div>

              <div className={styles.rangeContainer}>
                <Switch value={range} onClick={() => handleAutoChange(!range, 'range')} />
                <p className={styles.subtitle}>{t('auto')}</p>
              </div>
            </div>

            {!range && (
              <div className={styles.range}>
                <div className={styles.rangeContainer}>
                  <span className={styles.rangeLabel}>{t('from')}</span>
                  <Controller
                    control={control}
                    name="from"
                    render={({ field: { value, onChange } }) => <TimeCodesInput value={value} onComplete={onChange} />}
                  />
                </div>

                <div className={styles.rangeContainer}>
                  <span className={styles.rangeLabel}>{t('to')}</span>
                  <Controller
                    control={control}
                    name="to"
                    render={({ field: { value, onChange } }) => <TimeCodesInput value={value} onComplete={onChange} />}
                  />
                </div>
              </div>
            )}

            {(errors.from || errors.to) && (
              <p className={styles.errorText}>{errors.from?.message ?? errors.to?.message}</p>
            )}
          </div>
        )}

        {type === 'file' && (
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.label}>
                <p className={styles.subtitle}>{t('choose_pages_range')}</p>
                {cannot('choose-quiz-options') ? (
                  <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
                ) : (
                  <LockOpenIcon />
                )}
              </div>

              <div className={styles.switch}>
                <Switch value={range} onClick={() => handleAutoChange(!range, 'range')} />
                <p className={styles.subtitle}>{t('auto')}</p>
              </div>
            </div>

            {!range && (
              <div className={styles.range}>
                <div className={styles.rangeContainer}>
                  <span className={styles.rangeLabel}>{t('from')}</span>
                  <input
                    type="number"
                    className={cn(styles.rangeInput, errors.from && styles.error)}
                    {...register('from', {
                      required: t('field_required'),
                    })}
                    disabled={range}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div className={styles.rangeContainer}>
                  <span className={styles.rangeLabel}>{t('to')}</span>
                  <input
                    type="number"
                    disabled={range}
                    className={cn(styles.rangeInput, errors.from && styles.error)}
                    {...register('to', {
                      required: t('field_required'),
                    })}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            )}

            {(errors.from || errors.to) && (
              <p className={styles.errorText}>{errors.from?.message ?? errors.to?.message}</p>
            )}
          </div>
        )}

        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.label}>
              <p className={styles.subtitle}>{t('difficulty')} </p>
              {cannot('choose-quiz-options') ? (
                <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
              ) : (
                <LockOpenIcon />
              )}
            </div>

            <div className={styles.switch}>
              <Switch value={difficulty} onClick={() => handleAutoChange(!difficulty, 'difficulty')} />
              <p className={styles.subtitle}>{t('auto')}</p>
            </div>
          </div>

          {!difficulty && (
            <div style={{ width: '100%', maxWidth: 290, display: 'flex', alignSelf: 'flex-end' }}>
              <Controller
                control={control}
                name="difficulty"
                rules={{ required: t('field_required') }}
                render={({ field: { value, onChange } }) => (
                  <AppSelect
                    value={value}
                    placeholder={t('choose_difficulty')}
                    options={DIFFICULTY.map((item) => ({
                      id: item.key,
                      title: t(item.i18nKey),
                    }))}
                    onSelect={onChange}
                  />
                )}
              />
            </div>
          )}
        </div>

        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.label}>
              <p className={styles.subtitle}>{t('questions')}</p>
              {cannot('choose-quiz-options') ? (
                <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
              ) : (
                <LockOpenIcon />
              )}
            </div>

            <div className={styles.switch}>
              <Switch value={questions} onClick={() => handleAutoChange(!questions, 'questions')} />
              <p className={styles.subtitle}>{t('auto')}</p>
            </div>
          </div>

          {!questions && (
            <div className={styles.questions_container}>
              <div className={styles.input_wrapper}>
                <input
                  type="number"
                  className={cn(styles.questionInput, errors.singleChoice && styles.error)}
                  onKeyDown={handleKeyDown}
                  {...register('singleChoice')}
                  disabled={questions}
                />
                <p className={styles.questionLabel}>{t('single_choice')}</p>
              </div>

              <div className={styles.input_wrapper}>
                <input
                  type="number"
                  className={cn(styles.questionInput, errors.multiChoice && styles.error)}
                  onKeyDown={handleKeyDown}
                  {...register('multiChoice')}
                />
                <p className={styles.questionLabel}>
                  {t('multiple_choice')}{' '}
                  {cannot('choose-quiz-options') ? (
                    <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
                  ) : (
                    <LockOpenIcon />
                  )}
                </p>
              </div>

              <div className={styles.input_wrapper}>
                <input
                  type="number"
                  className={cn(styles.questionInput, errors.matching && styles.error)}
                  onKeyDown={handleKeyDown}
                  {...register('matching')}
                />
                <p className={styles.questionLabel}>
                  {t('matching')}{' '}
                  {cannot('choose-quiz-options') ? (
                    <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
                  ) : (
                    <LockOpenIcon />
                  )}
                </p>
              </div>
              <div className={styles.input_wrapper}>
                <input
                  type="number"
                  className={cn(styles.questionInput, errors.open && styles.error)}
                  onKeyDown={handleKeyDown}
                  {...register('open')}
                />
                <p className={styles.questionLabel}>
                  {t('open')}{' '}
                  {cannot('choose-quiz-options') ? (
                    <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
                  ) : (
                    <LockOpenIcon />
                  )}
                </p>
              </div>

              <div className={styles.input_wrapper}>
                <input
                  type="number"
                  className={cn(styles.questionInput, errors.fillIn && styles.error)}
                  onKeyDown={handleKeyDown}
                  {...register('fillIn')}
                />
                <p className={styles.questionLabel}>
                  {t('fill_in')}{' '}
                  {cannot('choose-quiz-options') ? (
                    <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
                  ) : (
                    <LockOpenIcon />
                  )}
                </p>
              </div>
            </div>
          )}

          {can('choose-quiz-options') && totalQuestions > maxNumberOfQuestions && (
            <p className={styles.errorText}>{`${t('you_reached_question_types_limit')} (${maxNumberOfQuestions})`}</p>
          )}
        </div>

        {type !== 'text' && (
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.label}>
                <p className={styles.subtitle}>{t('your_prompt')}</p>
                {cannot('choose-quiz-options') ? (
                  <LockClosedIcon onClick={() => openPermissionModal('choose-quiz-options')} />
                ) : (
                  <LockOpenIcon />
                )}
              </div>

              <div className={styles.switch}>
                <Switch value={prompt} onClick={() => handleAutoChange(!prompt, 'prompt')} />
                <p className={styles.subtitle}>{t('auto')}</p>
              </div>
            </div>

            {!prompt && (
              <div className={styles.textarea}>
                <Controller
                  control={control}
                  name="prompt"
                  rules={{
                    maxLength: {
                      message: '',
                      value: 100,
                    },
                  }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <>
                      <textarea
                        className={error ? styles.error : ''}
                        placeholder={t('prompt_placeholder')}
                        value={value}
                        onChange={onChange}
                      />
                      <p className={error ? styles.errorText : ''}>{`${value?.length ?? 0}/${100}`}</p>
                    </>
                  )}
                />
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {/* eslint-disable-next-line react/style-prop-object */}
          <Button style="transparent" onClick={onBackClick} width="fit-content" fontSize="20px" padding="12px 20px">
            <img src={arrowIcon} alt="Sparkles icon" /> {t('back').toUpperCase()}
          </Button>
          {/* eslint-disable-next-line react/style-prop-object */}
          <Button style="purple" disabled={!isValid} width="270px" fontSize="20px" padding="12px 20px">
            <img src={sparklesIcon} alt="Sparkles icon" /> {t('generate').toUpperCase()}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomizeStep;
