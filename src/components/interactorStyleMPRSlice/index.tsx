import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkInteractorStyleMPRSlice from '@kitware/vtk.js/Interaction/Style/InteractorStyleMPRSlice';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import { setInitializeViewer } from '../../utils/common';

const InteractorStyleMPRSlice = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = () => {
    const { objs, images } = setInitializeViewer(sliceRef, volume);

    objs.forEach((obj) => {
      obj.interactor.initialize();
      obj.interactor.bindEvents(sliceRef.current);
      images.forEach((image) => {
        const istyle = vtkInteractorStyleMPRSlice.newInstance();

        const actor = vtkVolume.newInstance();
        const mapper = vtkVolumeMapper.newInstance();
        actor.setMapper(mapper);

        obj.interactor.setInteractorStyle(istyle);
        const ofun = vtkPiecewiseFunction.newInstance();
        ofun.addPoint(200.0, 1);
        ofun.addPoint(1200.0, 0.8);
        ofun.addPoint(4000.0, 0.8);

        actor.getProperty().setScalarOpacity(0, ofun);
        actor.getProperty().setScalarOpacityUnitDistance(0, 4.5);

        if (Object.keys(image).length !== 0) {
          mapper.setInputData(image);
          istyle.setVolumeMapper(mapper);
        }

        obj.renderer.addVolume(actor);
        obj.renderWindow.render();
      });
    });
  };

  useEffect(() => {
    if (sliceRef.current) setup();
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { InteractorStyleMPRSlice };
