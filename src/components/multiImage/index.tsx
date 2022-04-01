import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkInteractorStyleMPRSlice from '@kitware/vtk.js/Interaction/Style/InteractorStyleMPRSlice';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import { SlabMode } from '@kitware/vtk.js/Imaging/Core/ImageReslice/Constants';
import { setInitializeViewer } from '../../utils/common';
import { ROI_COLOR_LUT } from '../../variables/mock';

const MultiImage = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = () => {
    const { objs, images } = setInitializeViewer(sliceRef, volume);

    if (objs.length > 0 && images.length > 0) {
      objs.forEach((obj) => {
        obj.interactor.initialize();
        obj.interactor.bindEvents(sliceRef.current);
        obj.interactor.setInteractorStyle(vtkInteractorStyleMPRSlice.newInstance());
        images.forEach((image) => {
          const actor = vtkVolume.newInstance();
          const mapper = vtkVolumeMapper.newInstance();
          mapper.setInputData(image);
          obj.renderer.addVolume(actor);

          obj.reslice.setSlabMode(SlabMode.MEAN);
          obj.reslice.setSlabNumberOfSlices(1);
          obj.reslice.setTransformInputSampling(false);
          obj.reslice.setAutoCropOutput(true);
          obj.reslice.setOutputDimensionality(2);

          const imageActor = vtkImageSlice.newInstance();
          const imageMapper = vtkImageMapper.newInstance();

          const cfun = vtkColorTransferFunction.newInstance();
          for (let i = 0; i < ROI_COLOR_LUT.length; i++) {
            const item = ROI_COLOR_LUT[i];
            const x = item[0] as number;
            const rgb = item[1];
            if (Array.isArray(rgb)) {
              cfun.addRGBPoint(x, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
            }
          }

          obj.renderer.addActor(imageActor);

          imageMapper.setInputConnection(obj.reslice.getOutputPort());
          // @ts-ignore
          imageActor.setMapper(imageMapper);

          obj.reslice.setInputData(image);
        });
        obj.renderer.resetCamera();
        obj.renderer.resetCameraClippingRange();
        obj.renderWindow.render();
      });
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup();
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { MultiImage };
