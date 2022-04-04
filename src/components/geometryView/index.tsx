import React, { useEffect, useRef, useState } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import { debounce } from '@kitware/vtk.js/macros';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';

import { ControlBar } from './controlBar';
import { setInitializeViewer } from '../../utils/common';

const GeometryView = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState<any>([]);

  const setup = (ref: any) => {
    const { objs, images } = setInitializeViewer(sliceRef, volume);

    setControls(images);

    if (objs.length > 0 && images.length > 0) {
      objs.forEach((obj) => {
        obj.interactor.initialize();
        obj.interactor.bindEvents(ref.current);
        let scalarBarActor = vtkScalarBarActor.newInstance();
        obj.renderer.addActor(scalarBarActor);
        images.forEach((image) => {
          const lookupTable = vtkColorTransferFunction.newInstance();
          const mapper = vtkMapper.newInstance();
          const actor = vtkActor.newInstance();

          const scalars = image.getPointData().getScalars();
          const dataRange: any = [].concat(scalars ? scalars.getRange() : [0, 1]);

          mapper.set({
            colorByArrayName: 'Normal1',
            colorMode: 1,
            scalarMode: 3,
            interpolateScalarsBeforeMapping: true,
            scalarVisibility: true,
            lookupTable,
          });

          const preset = vtkColorMaps.getPresetByName('erdc_rainbow_bright');
          lookupTable.applyColorMap(preset);
          lookupTable.setMappingRange(dataRange[0], dataRange[1]);
          lookupTable.updateRange();

          // actor.getProperty().set({ visiblility: 1, representation: 1, edgeVisibility: 0 });
          // actor.getProperty().setOpacity(80);

          actor.setMapper(mapper);
          mapper.setInputData(image);
          obj.renderer.addActor(actor);

          scalarBarActor.setAxisLabel('Normal1');
          scalarBarActor.setVisibility(true);

          scalarBarActor.setScalarsToColors(mapper.getLookupTable());

          const debouncedRender = debounce(obj.renderWindow.render, 10);
          lookupTable.onModified(debouncedRender);

          obj.renderer.resetCamera();
          obj.renderWindow.render();
        });
      });
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return (
    <>
      {/*{controls.length > 0 && controls.map(() => <ControlBar />)}*/}
      <div ref={sliceRef} />
    </>
  );
};

export { GeometryView };
