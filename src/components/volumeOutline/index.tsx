import React, { useEffect, useRef } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Volume';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkInteractorStyleMPRSlice from '@kitware/vtk.js/Interaction/Style/InteractorStyleMPRSlice';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';

import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import { ATROPHY_ROI_COLOR_LUT } from '../../utils/mock';
const { convertItkToVtkImage } = ITKHelper;

const VolumeOutline = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const setup = (refs: any) => {
    function createLabelPipeline(backgroundImageData: any) {
      // Create a labelmap image the same dimensions as our background volume.
      const labelMapData = vtkImageData.newInstance(
        backgroundImageData.get('spacing', 'origin', 'direction'),
      );

      labelMapData.computeTransforms();

      const values = new Uint8Array(backgroundImageData.getNumberOfPoints());
      const dataArray = vtkDataArray.newInstance({
        numberOfComponents: 1, // labelmap with single component
        values,
      });
      labelMapData.getPointData().setScalars(dataArray);
      labelMapData.setDimensions(backgroundImageData.getDimensions());
      labelMapData.setSpacing(backgroundImageData.getSpacing());
      labelMapData.setOrigin(backgroundImageData.getOrigin());
      labelMapData.setDirection(backgroundImageData.getDirection());

      const labelMap = {
        actor: vtkVolume.newInstance(),
        mapper: vtkVolumeMapper.newInstance(),
        imageData: labelMapData,
        cfun: vtkColorTransferFunction.newInstance(),
        ofun: vtkPiecewiseFunction.newInstance(),
      };

      // Labelmap pipeline
      //@ts-ignore
      labelMap.mapper.setInputData(labelMapData);
      labelMap.actor.setMapper(labelMap.mapper);

      // Set up labelMap color and opacity mapping
      for (let i = 0; i < ATROPHY_ROI_COLOR_LUT.length; i++) {
        const item = ATROPHY_ROI_COLOR_LUT[i];
        const x = item[0] as number;
        const rgb = item[1];
        if (Array.isArray(rgb)) {
          labelMap.cfun.addRGBPoint(x, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
        }
      }
      labelMap.ofun.addPoint(0, 0);
      labelMap.ofun.addPointLong(1, 0.5, 0.5, 1.0); // Red will have an opacity of 0.2.
      labelMap.ofun.addPointLong(2, 0.5, 0.5, 1.0); // Green will have an opacity of 0.2.
      labelMap.ofun.setClamping(false);

      labelMap.actor.getProperty().setRGBTransferFunction(0, labelMap.cfun);
      labelMap.actor.getProperty().setScalarOpacity(0, labelMap.ofun);
      labelMap.actor.getProperty().setInterpolationTypeToNearest();
      labelMap.actor.getProperty().setUseLabelOutline(true);
      labelMap.actor.getProperty().setLabelOutlineThickness(3);

      return labelMap;
    }

    function fillBlobForThreshold(imageData: any, backgroundImageData: any) {
      const dims = imageData.getDimensions();
      const values = imageData.getPointData().getScalars().getData();

      const backgroundValues = backgroundImageData.getPointData().getScalars().getData();
      const size = dims[0] * dims[1] * dims[2];

      // Head
      const headThreshold = [324, 1524];
      for (let i = 0; i < size; i++) {
        if (backgroundValues[i] >= headThreshold[0] && backgroundValues[i] < headThreshold[1]) {
          values[i] = 1;
        }
      }

      // Bone
      const boneThreshold = [1200, 2324];
      for (let i = 0; i < size; i++) {
        if (backgroundValues[i] >= boneThreshold[0] && backgroundValues[i] < boneThreshold[1]) {
          values[i] = 2;
        }
      }

      imageData.getPointData().getScalars().setData(values);
    }

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

    const istyle = vtkInteractorStyleMPRSlice.newInstance();
    obj.renderWindow.getInteractor().setInteractorStyle(istyle);

    const actor = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();
    actor.setMapper(mapper);

    const ofun = vtkPiecewiseFunction.newInstance();
    ofun.addPoint(0, 0);
    ofun.addPoint(1, 1.0);
    actor.getProperty().setScalarOpacity(0, ofun);

    mapper.setInputData(image);

    const labelMap = createLabelPipeline(image);

    const sourceDataRGBTransferFunction = actor.getProperty().getRGBTransferFunction(0);
    sourceDataRGBTransferFunction.setMappingRange(0, 2035);

    fillBlobForThreshold(labelMap.imageData, image);

    // Set interactor style volume mapper after mapper sets input data
    istyle.setVolumeMapper(mapper);

    obj.renderer.addVolume(actor);
    obj.renderer.addVolume(labelMap.actor);
    obj.renderer.getActiveCamera().setViewUp(1, 0, 0);
    obj.renderWindow.render();
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return <div ref={sliceRef} />;
};

export { VolumeOutline };
