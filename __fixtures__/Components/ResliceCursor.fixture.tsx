import React, { useState } from 'react';
import { DataImport, ResliceCursor } from '../../src/components';

export default function ResliceCursorFixture() {
  const [volume, setVolume] = useState(null);

  const callbackData = (data: any) => {
    setVolume(data);
  };

  return (
    <>
      <DataImport callback={callbackData} />
      {volume && <ResliceCursor volume={volume} />}
    </>
  );
}
