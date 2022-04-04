import React, { useState } from 'react';
import { DataImport, GeoMetry } from '../../src/components';

export default function GeoMetryFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    setVolume(data);
  };

  return (
    <>
      <DataImport callback={callbackData} />
      {volume && <GeoMetry volume={volume} />}
    </>
  );
}
