import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import { ROI_COLOR_LUT } from '../../variables/mock';

const { convertItkToVtkImage } = ITKHelper;

const VolumeView = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = (refs: any) => {
    const grw = vtkGenericRenderWindow.newInstance();
    grw.setContainer(refs.current);
    grw.resize();

    let direction = {
      rows: 3,
      columns: 3,
      data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };

    let centerImage = { ...volume.image, direction };

    const image = convertItkToVtkImage(centerImage);

    const obj: any = {
      renderWindow: grw.getRenderWindow(),
      renderer: grw.getRenderer(),
      GLWindow: grw.getOpenGLRenderWindow(),
    };
    obj.renderWindow.addRenderer(obj.renderer);
    obj.renderWindow.addView(obj.GLWindow);

    const actor = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();
    actor.setMapper(mapper);

    // create color and opacity transfer functions
    const ctfun = vtkColorTransferFunction.newInstance();
    ctfun.applyColorMap(vtkColorMaps.getPresetByName('2hot'));

    for (let i = 0; i < ROI_COLOR_LUT.length; i++) {
      const item = ROI_COLOR_LUT[i];
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
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { VolumeView };
