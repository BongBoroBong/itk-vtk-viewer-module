import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkInteractorStyleMPRSlice from '@kitware/vtk.js/Interaction/Style/InteractorStyleMPRSlice';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import { ATROPHY_ROI_COLOR_LUT } from '../../utils/mock';

const { convertItkToVtkImage } = ITKHelper;

const InteractorStyleMPRSlice = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = (refs: any) => {
    if (Array.isArray(volume.image)) {
      const grw = vtkGenericRenderWindow.newInstance();
      grw.setContainer(refs.current);
      grw.resize();
      const obj: any = {
        renderWindow: grw.getRenderWindow(),
        renderer: grw.getRenderer(),
        GLWindow: grw.getOpenGLRenderWindow(),
        interactor: grw.getInteractor(),
      };
      obj.renderWindow.addRenderer(obj.renderer);
      obj.renderWindow.addView(obj.GLWindow);
      obj.renderWindow.setInteractor(obj.interactor);
      obj.interactor.setView(obj.GLWindow);
      obj.interactor.initialize();
      obj.interactor.bindEvents(refs.current);

      for (let i = 0; i < volume.image.length; i++) {
        const direction = {
          rows: 3,
          columns: 3,
          data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
        };
        const volumeImage = { ...volume.image[i], direction };
        const image = convertItkToVtkImage(volumeImage);

        const istyle = vtkInteractorStyleMPRSlice.newInstance();

        const actor = vtkVolume.newInstance();
        const mapper = vtkVolumeMapper.newInstance();
        actor.setMapper(mapper);

        obj.interactor.setInteractorStyle(istyle);

        const cfun = vtkColorTransferFunction.newInstance();
        for (let i = 0; i < ATROPHY_ROI_COLOR_LUT.length; i++) {
          const item = ATROPHY_ROI_COLOR_LUT[i];
          const x = item[0] as number;
          const rgb = item[1];
          if (Array.isArray(rgb)) {
            cfun.addRGBPoint(x, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
          }
        }

        if (Object.keys(image).length !== 0) {
          mapper.setInputData(image);
          istyle.setVolumeMapper(mapper);
        }
        obj.renderer.addVolume(actor);
        obj.renderWindow.render();
      }
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { InteractorStyleMPRSlice };
