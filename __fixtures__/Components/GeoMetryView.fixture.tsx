import React, { useState } from 'react';
import { DataImport, GeometryView } from '../../src/components';

export default function GeoMetryViewFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    setVolume(data);
  };

  return (
    <>
      <DataImport callback={callbackData} />
      {volume && <GeometryView volume={volume} />}
    </>
  );
}
