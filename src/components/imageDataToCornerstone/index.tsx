import React, { useEffect, useRef } from 'react';

import vtkImageDataToCornerstoneImage from '@kitware/vtk.js/Filters/Cornerstone/ImageDataToCornerstoneImage';
import { setInitializeViewer } from '../../utils/common';

const ImageDataToCornerstone = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = () => {
    const { objs, images } = setInitializeViewer(sliceRef, volume);

    if (objs.length > 0 && images.length > 0) {
      objs.forEach(() => {
        images.forEach(async (image) => {
          const cornerstoneData = vtkImageDataToCornerstoneImage.newInstance();
          cornerstoneData.setInputData(image);
          console.log('cornerstoneData', cornerstoneData.getOutputData());
        });
      });
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup();
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { ImageDataToCornerstone };
