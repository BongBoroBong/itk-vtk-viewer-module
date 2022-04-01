import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import { debounce } from '@kitware/vtk.js/macros';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';

import { ColorMode, ScalarMode } from '@kitware/vtk.js/Rendering/Core/Mapper/Constants';
const { convertItkToVtkImage } = ITKHelper;

const GeometryView = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = (ref: any) => {
    if (Array.isArray(volume.image)) {
      const grw = vtkGenericRenderWindow.newInstance();
      if (sliceRef.current) grw.setContainer(ref.current);
      grw.resize();

      let direction = {
        rows: 3,
        columns: 3,
        data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      };

      const obj: any = {
        renderWindow: grw.getRenderWindow(),
        renderer: grw.getRenderer(),
        GLWindow: grw.getOpenGLRenderWindow(),
      };
      obj.renderWindow.addRenderer(obj.renderer);
      obj.renderWindow.addView(obj.GLWindow);
      obj.interactor.setView(obj.GLWindow);
      obj.interactor.initialize();
      obj.interactor.bindEvents(ref.current);

      let scalarBarActor = vtkScalarBarActor.newInstance();
      obj.renderer.addActor(scalarBarActor);

      for (let i = 0; i < volume.image.length; i++) {
        let centerImage = { ...volume.image[i], direction };
        const image = convertItkToVtkImage(centerImage);

        const lookupTable = vtkColorTransferFunction.newInstance();
        const mapper = vtkMapper.newInstance({
          interpolateScalarsBeforeMapping: true,
          useLookupTableScalarRange: true,
          scalarVisibility: false,
        });

        mapper.setLookupTable(lookupTable);
        mapper.setColorByArrayName('Normal1');
        const actor = vtkActor.newInstance();

        const scalars = image.getPointData().getScalars();
        const dataRange: any = [].concat(scalars ? scalars.getRange() : [0, 1]);

        function applyPreset() {
          const preset = vtkColorMaps.getPresetByName('erdc_rainbow_bright');
          lookupTable.applyColorMap(preset);
          lookupTable.setMappingRange(dataRange[0], dataRange[1]);
          lookupTable.updateRange();
          obj.renderWindow.render();
        }
        applyPreset();

        const lut = mapper.getLookupTable();
        lut.setVectorModeToComponent();
        lut.setVectorComponent(1);
        lookupTable.setMappingRange(dataRange[0], dataRange[1]);
        lut.updateRange();

        actor.getProperty().set({ representation: 1 });
        actor.getProperty().setOpacity(100);

        let colorMode = ColorMode.MAP_SCALARS;
        let scalarMode = ScalarMode.USE_POINT_FIELD_DATA;

        mapper.set({
          colorMode,
          scalarMode,
        });

        actor.setMapper(mapper);
        mapper.setInputData(image);
        obj.renderer.addActor(actor);

        scalarBarActor.setScalarsToColors(mapper.getLookupTable());
        const debouncedRender = debounce(obj.renderWindow.render, 10);
        lookupTable.onModified(debouncedRender);

        obj.renderer.resetCamera();
        obj.renderWindow.render();
      }

      obj.renderWindow.render();
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { GeometryView };
