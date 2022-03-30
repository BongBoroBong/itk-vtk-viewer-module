import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import { ControlBar } from './controlBar';

const { convertItkToVtkImage } = ITKHelper;

const GeometryView = ({ volume }: any) => {
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

    const lookupTable = vtkColorTransferFunction.newInstance();

    const mapper = vtkMapper.newInstance({
      interpolateScalarsBeforeMapping: false,
      useLookupTableScalarRange: true,
      scalarVisibility: false,
    });
    const actor = vtkActor.newInstance();

    mapper.setLookupTable(lookupTable);
    const scalars = image.getPointData().getScalars();
    const dataRange = [].concat(scalars ? scalars.getRange() : [0, 1]);

    // --------------------------------------------------------------------
    // Color handling
    // --------------------------------------------------------------------

    const preset = vtkColorMaps.getPresetByName('erdc_rainbow_bright');
    lookupTable.applyColorMap(preset);
    lookupTable.setMappingRange(dataRange[0], dataRange[1]);
    lookupTable.updateRange();
    actor.getProperty().set({ representation: 1 });

    actor.setMapper(mapper);
    mapper.setInputData(image);
    let scalarBarActor = vtkScalarBarActor.newInstance();
    obj.renderer.addActor(scalarBarActor);
    scalarBarActor.setAxisLabel('(p) Normals');
    obj.renderer.addActor(actor);

    obj.renderer.resetCamera();
    obj.renderWindow.render();
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return (
    <>
      <ControlBar />
      <div ref={sliceRef} />
    </>
  );
};

export { GeometryView };
