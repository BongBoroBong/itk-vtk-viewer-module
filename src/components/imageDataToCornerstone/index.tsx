import React, { useEffect, useRef } from 'react';

import vtkImageDataToCornerstone from '@kitware/vtk.js/Filters/Cornerstone/ImageDataToCornerstoneImage';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';

const { convertItkToVtkImage } = ITKHelper;
const ImageDataToCornerstone = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = (refs: any) => {
    if (Array.isArray(volume.image)) {
      const cornerstoneData = vtkImageDataToCornerstone.newInstance();

      for (let i = 0; i < volume.image.length; i++) {
        const image = convertItkToVtkImage(volume.image[i]);
        cornerstoneData.setInputData(image);
        console.log('cornerstoneData', cornerstoneData.getInputData());
      }
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { ImageDataToCornerstone };
