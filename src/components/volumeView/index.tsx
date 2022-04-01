import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import { ROI_COLOR_LUT } from '../../variables/mock';
import { setInitializeViewer } from '../../utils/common';

const VolumeView = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = () => {
    const { objs, images } = setInitializeViewer(sliceRef, volume);

    if (objs.length > 0 && images.length > 0) {
      objs.forEach((obj) => {
        images.forEach((image) => {
          const actor = vtkVolume.newInstance();
          const mapper = vtkVolumeMapper.newInstance();
          actor.setMapper(mapper);

          const ctfun = vtkColorTransferFunction.newInstance();
          ctfun.applyColorMap(vtkColorMaps.getPresetByName('2hot'));

          for (let k = 0; k < ROI_COLOR_LUT.length; k++) {
            const item = ROI_COLOR_LUT[k];
            const x = item[0] as number;
            const rgb = item[1];
            if (Array.isArray(rgb)) {
              ctfun.addRGBPoint(x, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
            }
          }

          const ofun = vtkPiecewiseFunction.newInstance();
          ofun.addPoint(200.0, 0.0);
          ofun.addPoint(1200.0, 0.5);
          ofun.addPoint(3000.0, 0.8);
          actor.getProperty().setRGBTransferFunction(0, ctfun);
          actor.getProperty().setScalarOpacity(0, ofun);
          actor.getProperty().setScalarOpacityUnitDistance(0, 4.5);
          actor.getProperty().setSpecular(0.3);
          actor.getProperty().setSpecularPower(8.0);

          mapper.setInputData(image);

          obj.renderer.addVolume(actor);
          obj.renderer.resetCamera();
          obj.renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });

          obj.renderWindow.render();
        });
      });
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup();
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { VolumeView };
