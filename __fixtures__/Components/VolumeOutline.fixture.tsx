import React, { useState } from 'react';
import { DataImport, VolumeOutline } from '../../src/components';

export default function VolumeOutlineFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    setVolume(data);
  };

  return (
    <>
      <DataImport callback={callbackData} />
      {volume && <VolumeOutline volume={volume} />}
    </>
  );
}
