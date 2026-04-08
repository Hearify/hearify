import React from 'react';

import styles from './Gallery.module.scss';
import preset_1 from '../../../assets/images/quiz_presets/preset_1.png';
import preset_2 from '../../../assets/images/quiz_presets/preset_2.png';
import preset_3 from '../../../assets/images/quiz_presets/preset_3.png';
import preset_4 from '../../../assets/images/quiz_presets/preset_4.png';
import preset_5 from '../../../assets/images/quiz_presets/preset_5.png';
import preset_6 from '../../../assets/images/quiz_presets/preset_6.png';
import preset_7 from '../../../assets/images/quiz_presets/preset_7.png';
import preset_8 from '../../../assets/images/quiz_presets/preset_8.png';

const presets = [
  { id: '1', src: preset_1 },
  { id: '2', src: preset_2 },
  { id: '3', src: preset_3 },
  { id: '4', src: preset_4 },
  { id: '5', src: preset_5 },
  { id: '6', src: preset_6 },
  { id: '7', src: preset_7 },
  { id: '8', src: preset_8 },
];

type GalleryProps = {
  handleSetPreset: (arg: string) => void;
};

const Gallery: React.FC<GalleryProps> = ({ handleSetPreset }) => {
  return (
    <div className={styles.container}>
      {presets.map((preset) => (
        <button type="button" onClick={() => handleSetPreset(preset.id)} key={preset.id}>
          <img src={preset.src} draggable="false" alt={`Preset number ${preset.id}`} />
        </button>
      ))}
    </div>
  );
};

export default Gallery;
