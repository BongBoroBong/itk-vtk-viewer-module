import React, { useState } from 'react';
import { DataImport, ImageDataToCornerstone } from '../../src/components';

export default function ImageDataToCornerstoneFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    console.log('data', data);
    setVolume(data);
  };

  return (
    <>
      <DataImport accept={'.ima, .nii, .dcm'} callback={callbackData} />
      {volume && <ImageDataToCornerstone volume={volume} />}
    </>
  );
}
