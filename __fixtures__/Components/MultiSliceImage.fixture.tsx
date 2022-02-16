import React, { useState } from 'react';
import { DataImport, MultiSliceImage } from '../../src/components';

export default function MultiSliceImageFixture() {
    const [volume, setVolume] = useState(null);

    const callbackData = (data: any) => {
        setVolume(data);
    };

    return (
        <>
            <DataImport callback={callbackData} />
            {volume && <MultiSliceImage volume={volume} />}
        </>
    );
}
