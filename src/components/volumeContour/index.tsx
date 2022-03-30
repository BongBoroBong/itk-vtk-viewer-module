import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import { ROI_COLOR_LUT } from '../../variables/mock';

const { convertItkToVtkImage } = ITKHelper;

const VolumeContour = ({ volume }: any) => {
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

    const dataRange = image.getPointData().getScalars().getRange();
    const firstIsoValue = (dataRange[0] + dataRange[1]) / 2;

    const mapper = vtkMapper.newInstance();
    const actor = vtkActor.newInstance();

    const marchingCube = vtkImageMarchingCubes.newInstance({
      contourValue: firstIsoValue,
      computeNormals: true,
      mergePoints: true,
    });

    marchingCube.setInputData(image);
    mapper.setInputConnection(marchingCube.getOutputPort());

    const lookupTable = vtkColorTransferFunction.newInstance();

    lookupTable.applyColorMap(vtkColorMaps.getPresetByName('2hot'));

    for (let i = 0; i < ROI_COLOR_LUT.length; i++) {
      const item = ROI_COLOR_LUT[i];
      const x = item[0] as number;
      const rgb = item[1];
      if (Array.isArray(rgb)) {
        lookupTable.addRGBPoint(x, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
      }
    }
    mapper.setLookupTable(lookupTable);

    actor.setMapper(mapper);
    actor.getProperty().setRepresentation(1);

    obj.renderer.addActor(actor);
    obj.renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
    obj.renderer.resetCamera();
    obj.renderWindow.render();
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { VolumeContour };
