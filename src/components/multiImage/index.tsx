import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkInteractorStyleMPRSlice from '@kitware/vtk.js/Interaction/Style/InteractorStyleMPRSlice';

const { convertItkToVtkImage } = ITKHelper;

const grw = vtkGenericRenderWindow.newInstance();
const obj: any = {
  renderWindow: grw.getRenderWindow(),
  renderer: grw.getRenderer(),
  GLWindow: grw.getOpenGLRenderWindow(),
  interactor: grw.getInteractor(),
};

const MultiImage = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = (refs: any) => {
    const setItkImage = (volume: any) => {
      const direction = {
        rows: 3,
        columns: 3,
        data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      };

      if (!volume) return {};
      const volumeImage = { ...volume.image, direction };
      return convertItkToVtkImage(volumeImage);
    };

    grw.setContainer(refs.current);
    grw.resize();

    const image = setItkImage(volume);

    obj.renderWindow.addRenderer(obj.renderer);
    obj.renderWindow.addView(obj.GLWindow);
    obj.renderWindow.setInteractor(obj.interactor);
    obj.interactor.setView(obj.GLWindow);
    obj.interactor.initialize();
    obj.interactor.bindEvents(refs.current);

    obj.interactor.setInteractorStyle(vtkInteractorStyleMPRSlice.newInstance());

    const actor = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();
    if (Object.keys(image).length !== 0) {
      mapper.setInputData(image);
    }
    // istyle.setVolumeMapper(mapper);
    // istyle.setSliceNormal(0, 0, 1);
    // const range = istyle.getSliceRange();
    // istyle.setSlice((range[0] + range[1]) / 2);

    obj.renderer.addVolume(actor);

    // obj.renderWindow.setInteractor(obj.interactor);
    //
    // obj.interactor.initialize();
    // obj.interactor.bindEvents(refs.current);
    // obj.interactor.setInteractorStyle(vtkInteractorStyleImage.newInstance());
    //
    // obj.reslice.setSlabMode(SlabMode.MEAN);
    // obj.reslice.setSlabNumberOfSlices(1);
    // obj.reslice.setTransformInputSampling(false);
    // obj.reslice.setAutoCropOutput(true);
    // obj.reslice.setOutputDimensionality(2);
    //
    // const imageActor = vtkImageSlice.newInstance();
    // const imageMapper = vtkImageMapper.newInstance();
    // const image2Actor = vtkImageSlice.newInstance();
    // const image2Mapper = vtkImageMapper.newInstance();
    // const image3Actor = vtkImageSlice.newInstance();
    // const image3Mapper = vtkImageMapper.newInstance();
    //
    // const cfun = vtkColorTransferFunction.newInstance();
    // for (let i = 0; i < ATROPHY_ROI_COLOR_LUT.length; i++) {
    //   const item = ATROPHY_ROI_COLOR_LUT[i];
    //   const x = item[0] as number;
    //   const rgb = item[1];
    //   if (Array.isArray(rgb)) {
    //     cfun.addRGBPoint(x, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
    //   }
    // }
    //
    // obj.renderer.addActor(imageActor);
    // obj.renderer.addActor(image2Actor);
    // obj.renderer.addActor(image3Actor);
    //
    // try {
    //   if (Object.keys(image).length !== 0) {
    //     // imageMapper.setInputData(image);
    //     imageMapper.setInputConnection(obj.reslice.getOutputPort());
    //     // @ts-ignore
    //     imageActor.setMapper(imageMapper);
    //
    //     obj.reslice.setInputData(image);
    //   }
    //   if (Object.keys(image2).length !== 0) {
    //     // image2Mapper.setInputData(image2);
    //     image2Mapper.setInputConnection(obj.reslice.getOutputPort());
    //     // @ts-ignore
    //     image2Actor.setMapper(image2Mapper);
    //     image2Actor.getProperty().setOpacity(0.2);
    //     image2Actor.getProperty().setRGBTransferFunction(0, cfun);
    //
    //     obj.reslice.setInputData(image2);
    //   }
    //   if (Object.keys(image3).length !== 0) {
    //     // image3Mapper.setInputData(image3);
    //     image3Mapper.setInputConnection(obj.reslice.getOutputPort());
    //     // @ts-ignore
    //     image3Actor.setMapper(image3Mapper);
    //     image3Actor.getProperty().setOpacity(0.2);
    //
    //     obj.reslice.setInputData(image3);
    //   }
    // } catch (e) {}

    // obj.renderer.resetCamera();
    // obj.renderer.resetCameraClippingRange();
    obj.renderWindow.render();
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { MultiImage };
