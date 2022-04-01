import React, { useEffect, useRef } from 'react';

import vtkImageDataToCornerstoneImage from '@kitware/vtk.js/Filters/Cornerstone/ImageDataToCornerstoneImage';
import { setInitializeViewer } from '../../utils/common';

const ImageDataToCornerstone = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = () => {
    const { objs, images } = setInitializeViewer(sliceRef, volume);

    if (objs.length > 0 && images.length > 0) {
      objs.forEach(() => {
        images.forEach((image) => {
          const cornerstoneData = vtkImageDataToCornerstoneImage.newInstance();
          cornerstoneData.setInputData(image);
          console.log('cornerstoneData', cornerstoneData.getInputData());
          console.log('aaa', cornerstoneData.get('imageId'));
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
