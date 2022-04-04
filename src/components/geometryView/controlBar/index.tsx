import React, { useState } from 'react';
import styled from '@emotion/styled';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    align-items: center;
  `,
  Label: styled.label`
    font-size: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
  `,
  Select: styled.select``,
  Range: styled.input``,
  Button: styled.button``,
};

const ControlBar = () => {
  const [representation, setRepresentation] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [lutName, setLutName] = useState('erdc_rainbow_bright');

  return (
    <S.Container>
      <S.Label>Data</S.Label>
      <S.Select
        defaultValue={representation}
        onChange={(event) => setRepresentation(+event.target.value)}
      >
        {['Hidden', 'Points', 'Wireframe', 'Surface', 'Surface with Edge'].map((name, idx) => (
          <option key={`representation_${idx}`} value={idx}>
            {name}
          </option>
        ))}
      </S.Select>
      <S.Select defaultValue={lutName} onChange={(event) => setLutName(event.target.value)}>
        {vtkColorMaps.rgbPresetNames.map((name: string, idx: number) => (
          <option key={`lut_${idx}`} value={name}>
            {name}
          </option>
        ))}
      </S.Select>
      <S.Range
        type="range"
        value={opacity}
        max="100"
        min="1"
        onChange={(event) => setOpacity(+event.target.value)}
      />
    </S.Container>
  );
};
export { ControlBar };
