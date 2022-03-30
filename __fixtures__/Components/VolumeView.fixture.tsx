import React, { useState } from 'react';
import { DataImport, VolumeView } from '../../src/components';

export default function VolumeViewFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    setVolume(data);
  };

  return (
    <>
      <DataImport callback={callbackData} />
      {volume && <VolumeView volume={volume} />}
    </>
  );
}
