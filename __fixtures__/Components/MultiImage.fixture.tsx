import React, { useState } from 'react';
import { DataImport, InteractorStyleMPRSlice } from '../../src/components';

export default function MultiImageFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    setVolume(data);
  };

  return (
    <>
      <DataImport accept={'.nii'} callback={callbackData} />
      {volume && <InteractorStyleMPRSlice volume={volume} />}
    </>
  );
}
