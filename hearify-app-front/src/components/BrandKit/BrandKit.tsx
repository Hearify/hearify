import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import styles from '@src/components/BrandKit/BrandKit.module.scss';
import Button from '@src/components/Button/Button';
import uploadIcon from '@src/assets/images/upload-icon-sm.svg';
import ColorPickerElement from '@src/components/BrandKit/ColorPickerElement';
import QuizFlowPreview from '@src/components/BrandKit/QuizFlowPreview/QuizFlowPreview';
import { errorToast, successToast } from '@src/toasts/toasts';
import { useAuthStore } from '@src/store/auth';
import { useFont } from '@src/util/hook/useFont';
import usePermission from '@v2/hooks/usePermission';

import type { Font } from '@src/util/hook/useFont';

export interface BrandKitDB {
  font: Font | null;
  logo_url: string | null;
  bg_color: string;
  button_fill: string;
  button_text: string;
  answer_fill: string;
  answer_text: string;
}

export interface BrandKitInterface {
  font: Font | null;
  logoUrl: string | null;
  bgColor: string;
  buttonFill: string;
  buttonText: string;
  answerFill: string;
  answerText: string;
}

export function mapToBrandKitInterface(brandKit: BrandKitDB): BrandKitInterface {
  return {
    font: brandKit.font,
    logoUrl: brandKit.logo_url,
    bgColor: brandKit.bg_color,
    buttonFill: brandKit.button_fill,
    buttonText: brandKit.button_text,
    answerFill: brandKit.answer_fill,
    answerText: brandKit.answer_text,
  };
}

export const defaultBrandKit: BrandKitInterface = {
  font: null,
  logoUrl: '',
  bgColor: '',
  buttonFill: '#6444F4',
  buttonText: '#FFFFFF',
  answerFill: '#6444F4',
  answerText: '#FFFFFF',
};

enum BackgroundColours {
  Selago = '#F5F4FE',
  WildSand = '#F4F4F4',
  Magnolia = '#FEFDFF',
  Catskill = '#F1F5F9',
  Ecru = '#F8F9F1',
}

const BrandKit = () => {
  const { t } = useTranslation('general');
  const navigate = useNavigate();
  const [clickedBgColor, setClickedBgColor] = useState(0);
  const { user } = useAuthStore((state) => state);
  const userId = user && user.id;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const { cannot, openPermissionModal } = usePermission();

  // COLOURS STATES
  const [buttonFill, setButtonFill] = useState('#6444F4');
  const [buttonText, setButtonText] = useState('#FFFFFF');
  const [answerFill, setAnswerFill] = useState('#6444F4');
  const [answerText, setAnswerText] = useState('#FFFFFF');

  const bgColoursArray: string[] = [];
  Object.values(BackgroundColours).forEach((value: string) => bgColoursArray.push(value));

  const [brandFont, setBrandFont] = useState<Font | null>(null);
  const [inputFontFamily, setInputFontFamily] = useState('Nunito');

  const brandKit: BrandKitInterface = {
    font: brandFont,
    logoUrl: blobUrl,
    bgColor: bgColoursArray[clickedBgColor],
    buttonFill,
    buttonText,
    answerFill,
    answerText,
  };

  const handleBgColorClick = (index: number) => {
    setClickedBgColor(index);
  };
  const handleSaveChangesClick = async () => {
    await axios
      .post('/api/brand-kit/save', {
        font: brandFont,
        logo_url: blobUrl,
        bg_color: brandKit.bgColor,
        button_fill: brandKit.buttonFill,
        button_text: brandKit.buttonText,
        answer_fill: brandKit.answerFill,
        answer_text: brandKit.answerText,
      })
      .then(() => {
        successToast(t('changes_saved'));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axios.get(`/api/brand-kit/${userId}`).then(({ data }) => {
      useFont(data.font);
      setBrandFont(data.font);
      setInputFontFamily(data.font.family);
      setBlobUrl(data.logo_url);
      setClickedBgColor(bgColoursArray.indexOf(data.bg_color));
      setButtonFill(data.button_fill);
      setButtonText(data.button_text);
      setAnswerFill(data.answer_fill);
      setAnswerText(data.answer_text);
    });
  }, [userId]);

  const getFontFace = async (fontFamily: string) => {
    await axios
      .get(`/api/brand-kit/fonts/${fontFamily}`)
      .then(({ data }) => {
        const font: Font = {
          family: data.family,
          url: `url(${data.url})`,
          options: data.options,
        };
        useFont(font);
        setBrandFont(font);
      })
      .catch((err) => {
        console.log(err);
        errorToast("Such font doesn't exist");
      });
  };

  const uploadLogo = () => {
    if (cannot('upload-logo')) {
      openPermissionModal('upload-logo');
    } else {
      uploadRef.current?.click();
    }
  };

  const handleFileUpload = async (event: any) => {
    const path = event.target.value.split('.');
    const extension = `${path[path.length - 1]}`;

    if (['png', 'jpg', 'jpeg'].includes(extension)) {
      const formData = new FormData();
      formData.append('file', event.target.files[0]);

      await axios
        .patch('/api/brand-kit/save-logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(({ data }) => {
          setBlobUrl(data.blob_url);
          if (data.status === 200) {
            successToast(t('logo_uploaded'));
          }
          console.log(data.message);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      errorToast(t('try_extension'));
      event.target.value = '';
    }
  };

  useEffect(() => {
    if (cannot('manage-brand-kit')) {
      openPermissionModal('manage-brand-kit', () => navigate('/home'));
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.kitSettings}>
        <div className={styles.kitSetting}>
          <h3>{t('upload_logo')}</h3>
          <input
            onChange={handleFileUpload}
            ref={uploadRef}
            type="file"
            accept="application/png"
            style={{ display: 'none' }}
          />
          <Button
            style="white"
            margin="0"
            fontSize="16px"
            width="95%"
            padding="20px"
            textColor="#15343a"
            className_={styles.uploadButton}
            onClick={uploadLogo}
          >
            <img src={uploadIcon} alt="upload" />
            <span className={styles.buttonInnerText}>{t('upload_logo_button').toUpperCase()}</span>
          </Button>
        </div>

        <div className={styles.kitSetting}>
          <h3>{t('choose_font')}</h3>
          <div className={styles.inputGroup}>
            <input
              defaultValue={brandKit.font?.family ? brandKit.font?.family : 'Nunito'}
              value={inputFontFamily}
              onChange={(event) => {
                setInputFontFamily(event.target.value);
              }}
            />
            <button
              onClick={() => {
                inputFontFamily !== 'Nunito' && getFontFace(inputFontFamily);
              }}
            >
              OK
            </button>
          </div>
        </div>

        <div className={styles.kitSetting}>
          <h3>{t('choose_colours')}</h3>
          <div className={styles.backgroundColours}>
            <span className={styles.optionText}>{t('background')}</span>
            {Object.values(BackgroundColours).map((value, index) => {
              return (
                <div
                  key={`BackgroundColor${index}`}
                  className={styles.backgroundColor}
                  style={{
                    backgroundColor: value,
                    border: clickedBgColor === index ? '2px solid #6444F4' : '2px solid rgba(51, 51, 51, 0.5)',
                  }}
                  onClick={() => {
                    handleBgColorClick(index);
                  }}
                />
              );
            })}
          </div>

          <div className={styles.colorSetting}>
            <div className={styles.buttonColours}>
              <span className={styles.optionText}>{t('button')}</span>
              <ColorPickerElement text={t('fill')} color={buttonFill} setColor={setButtonFill} />
              <ColorPickerElement text={t('text')} color={buttonText} setColor={setButtonText} />
            </div>

            <div className={styles.answerColours}>
              <span className={styles.optionText}>{t('answer')}</span>
              <ColorPickerElement text={t('fill')} color={answerFill} setColor={setAnswerFill} />
              <ColorPickerElement text={t('text')} color={answerText} setColor={setAnswerText} />
            </div>
          </div>
        </div>
      </div>

      <p className={styles.pageExampleText}>{t('page_example')}</p>
      <div className={styles.quizPreviewContainer} style={{ backgroundColor: bgColoursArray[clickedBgColor] }}>
        <QuizFlowPreview brandKit={brandKit} />
      </div>

      <div className={styles.saveChangesContainer}>
        <button className={styles.saveChanges} onClick={handleSaveChangesClick}>
          {t('save_changes')}
        </button>
      </div>
    </div>
  );
};

export default BrandKit;
