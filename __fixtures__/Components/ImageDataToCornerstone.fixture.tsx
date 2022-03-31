import React, { useState } from 'react';
import { DataImport, ImageDataToCornerstone } from '../../src/components';

export default function ImageDataToCornerstoneFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    setVolume(data);
  };

  return (
    <>
      <DataImport accept={'.nii'} callback={callbackData} />
      {volume && <ImageDataToCornerstone volume={volume} />}
    </>
  );
}
