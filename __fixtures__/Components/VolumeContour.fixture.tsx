import React, { useState } from 'react';
import { DataImport, VolumeContour } from '../../src/components';

export default function MultiSliceImageFixture() {
    const [volume, setVolume] = useState(null);

    const callbackData = (data: any) => {
        setVolume(data);
    };

    return (
        <>
            <DataImport callback={callbackData} />
            {volume && <VolumeContour volume={volume} />}
        </>
    );
}
