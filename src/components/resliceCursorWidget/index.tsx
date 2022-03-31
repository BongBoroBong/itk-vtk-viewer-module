import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkOutlineFilter from '@kitware/vtk.js/Filters/General/OutlineFilter';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkResliceCursorWidget from '@kitware/vtk.js/Widgets/Widgets3D/ResliceCursorWidget';
import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';

import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import { CaptureOn } from '@kitware/vtk.js/Widgets/Core/WidgetManager/Constants';
import { SlabMode } from '@kitware/vtk.js/Imaging/Core/ImageReslice/Constants';

import { xyzToViewType } from '@kitware/vtk.js/Widgets/Widgets3D/ResliceCursorWidget/Constants';
const { convertItkToVtkImage } = ITKHelper;

// Force the loading of HttpDataAccessHelper to support gzip decompression
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkImageProperty from '@kitware/vtk.js/Rendering/Core/ImageProperty';
import { ATROPHY_ROI_COLOR_LUT } from '../../utils/mock';

const StyledSectionView = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const StyledSereisView = styled.div`
  width: min(calc(50vh - 35px), 800px);
  min-width: 350px;
  min-height: 350px;
`;

const ResliceCursorWidget = ({ volume, volume2, volume3 }: any) => {
  const sereisOneRef = useRef<HTMLDivElement>(null);
  const sereisTwoRef = useRef<HTMLDivElement>(null);
  const sereisThreeRef = useRef<HTMLDivElement>(null);
  const series3DRef = useRef<HTMLDivElement>(null);

  let view3D: any = null;
  const viewAttributes: any[] = [];
  const widget = vtkResliceCursorWidget.newInstance();

  function updateReslice(
    interactionContext: any = {
      viewType: '',
      reslice: null,
      actor: null,
      reslice2: null,
      actor2: null,
      reslice3: null,
      actor3: null,
      renderer: null,
      resetFocalPoint: false, // Reset the focal point to the center of the display image
      keepFocalPointPosition: false, // Defines if the focal point position is kepts (same display distance from reslice cursor center)
      computeFocalPointOffset: false, // Defines if the display offset between reslice center and focal point has to be
      // computed. If so, then this offset will be used to keep the focal point position during rotation.
      spheres: null,
    },
  ) {
    const obj = widget.updateReslicePlane(interactionContext.reslice, interactionContext.viewType);
    widget.updateReslicePlane(interactionContext.reslice2, interactionContext.viewType);
    widget.updateReslicePlane(interactionContext.reslice3, interactionContext.viewType);
    if (obj.modified) {
      interactionContext.actor.setUserMatrix(interactionContext.reslice.getResliceAxes());
      interactionContext.actor2.setUserMatrix(interactionContext.reslice2.getResliceAxes());
      interactionContext.actor3.setUserMatrix(interactionContext.reslice3.getResliceAxes());
      interactionContext.sphereSources[0].setCenter(...obj.origin);
      interactionContext.sphereSources[1].setCenter(...obj.point1);
      interactionContext.sphereSources[2].setCenter(...obj.point2);
    }
    widget.updateCameraPoints(
      interactionContext.renderer,
      interactionContext.viewType,
      interactionContext.resetFocalPoint,
      interactionContext.keepFocalPointPosition,
      interactionContext.computeFocalPointOffset,
    );
    view3D && view3D.renderWindow.render();
    return obj.modified;
  }

  const setup = (refs: any) => {
    const setItkImage = (image: any) => {
      const direction = {
        rows: 3,
        columns: 3,
        data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      };

      if (!image) return {};
      return convertItkToVtkImage({ ...image.image, direction });
    };

    const createReslice = (obj: any, type: 'reslice' | 'reslice2' | 'reslice3') => {
      obj[type] = vtkImageReslice.newInstance();
      obj[type].setSlabMode(SlabMode.MEAN);
      obj[type].setSlabNumberOfSlices(1);
      obj[type].setTransformInputSampling(false);
      obj[type].setAutoCropOutput(false);
      obj[type].setOutputDimensionality(2);

      obj[`${type}Mapper`] = vtkImageMapper.newInstance();
      obj[`${type}Actor`] = vtkImageSlice.newInstance({
        property: vtkImageProperty.newInstance({
          independentComponents: false,
          ambient: 1.0,
          diffuse: 0.0,
          opacity: 0.8,
        }),
      });
      obj[`${type}Actor`].getProperty().setOpacity(0.2);

      if (type === 'reslice2') {
        const cfun = vtkColorTransferFunction.newInstance();
        for (let i = 0; i < ATROPHY_ROI_COLOR_LUT.length; i++) {
          const item = ATROPHY_ROI_COLOR_LUT[i];
          const x = item[0] as number;
          const rgb = item[1];
          if (Array.isArray(rgb)) {
            cfun.addRGBPoint(x, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
          }
        }
        obj[`${type}Actor`].getProperty().setRGBTransferFunction(0, cfun);
        obj[`${type}Actor`].getProperty().setInterpolationTypeToNearest();
        obj[`${type}Actor`].getProperty().setOpacity(0.6);
      }

      obj[`${type}Actor`].setMapper(obj[`${type}Mapper`]);
      obj[`${type}Mapper`].setInputConnection(obj[type].getOutputPort());
    };

    const widgetState = widget.getWidgetState();
    widgetState.setKeepOrthogonality(true);
    widgetState.setOpacity(0.6);
    widgetState.setSphereRadius(10);
    widgetState.setLineThickness(5);

    const image = setItkImage(volume);
    const image2 = setItkImage(volume2);
    const image3 = setItkImage(volume3);

    widget.setImage(image);

    for (let i = 0; i < 4; i++) {
      const grw = vtkGenericRenderWindow.newInstance();
      grw.setContainer(refs[i].current);
      grw.resize();

      const obj: any = {
        renderWindow: grw.getRenderWindow(),
        renderer: grw.getRenderer(),
        GLWindow: grw.getOpenGLRenderWindow(),
        interactor: grw.getInteractor(),
        widgetManager: vtkWidgetManager.newInstance(),
      };

      obj.renderer.getActiveCamera().setParallelProjection(true);
      obj.renderWindow.addRenderer(obj.renderer);
      obj.renderWindow.addView(obj.GLWindow);
      obj.renderWindow.setInteractor(obj.interactor);
      obj.interactor.setView(obj.GLWindow);
      obj.interactor.initialize();
      obj.interactor.bindEvents(refs[i].current);
      obj.widgetManager.setRenderer(obj.renderer);

      if (i < 3) {
        obj.interactor.setInteractorStyle(vtkInteractorStyleImage.newInstance());
        obj.widgetInstance = obj.widgetManager.addWidget(widget, xyzToViewType[i]);
        obj.widgetInstance.setScaleInPixels(true);
        obj.widgetInstance.setRotationHandlePosition(0.75);
        obj.widgetManager.enablePicking();
        // Use to update all renderers buffer when actors are moved
        obj.widgetManager.setCaptureOn(CaptureOn.MOUSE_MOVE);
      } else {
        obj.interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
      }

      createReslice(obj, 'reslice');
      createReslice(obj, 'reslice2');
      createReslice(obj, 'reslice3');

      obj.sphereActors = [];
      obj.sphereSources = [];

      for (let j = 0; j < 3; j++) {
        const sphere = vtkSphereSource.newInstance();
        sphere.setRadius(10);
        const mapper = vtkMapper.newInstance();
        mapper.setInputConnection(sphere.getOutputPort());
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        obj.sphereActors.push(actor);
        obj.sphereSources.push(sphere);
      }

      if (i < 3) {
        viewAttributes.push(obj);
      } else {
        view3D = obj;
      }

      // Create image outline in 3D view
      const outline: any = vtkOutlineFilter.newInstance();
      outline.setInputData(image);
      const outlineMapper = vtkMapper.newInstance();
      outlineMapper.setInputData(outline.getOutputData());
      const outlineActor = vtkActor.newInstance();
      outlineActor.setMapper(outlineMapper);

      view3D && view3D.renderer.addActor(outlineActor);

      viewAttributes.forEach((objItem, i) => {
        objItem.reslice.setInputData(image);
        objItem.reslice2.setInputData(image2);
        objItem.reslice3.setInputData(image3);
        objItem.renderer.addActor(objItem.resliceActor);
        objItem.renderer.addActor(objItem.reslice2Actor);
        objItem.renderer.addActor(objItem.reslice3Actor);
        view3D && view3D.renderer.addActor(objItem.resliceActor);
        view3D && view3D.renderer.addActor(objItem.reslice2Actor);
        view3D && view3D.renderer.addActor(objItem.reslice3Actor);
        objItem.sphereActors.forEach((actor: any) => {
          objItem.renderer.addActor(actor);
          view3D && view3D.renderer.addActor(actor);
        });

        const viewType = xyzToViewType[i];

        viewAttributes.forEach((v) => {
          v.widgetInstance.onInteractionEvent(
            ({ computeFocalPointOffset, canUpdateFocalPoint }: any) => {
              const activeViewType = widget.getWidgetState().getActiveViewType();
              const keepFocalPointPosition = activeViewType !== viewType && canUpdateFocalPoint;
              updateReslice({
                viewType,
                reslice: objItem.reslice,
                actor: objItem.resliceActor,
                reslice2: objItem.reslice2,
                actor2: objItem.reslice2Actor,
                reslice3: objItem.reslice3,
                actor3: objItem.reslice3Actor,
                renderer: objItem.renderer,
                resetFocalPoint: false,
                keepFocalPointPosition,
                computeFocalPointOffset,
                sphereSources: objItem.sphereSources,
              });
            },
          );
        });

        updateReslice({
          viewType,
          reslice: objItem.reslice,
          actor: objItem.resliceActor,
          reslice2: objItem.reslice2,
          actor2: objItem.reslice2Actor,
          reslice3: objItem.reslice3,
          actor3: objItem.reslice3Actor,
          renderer: objItem.renderer,
          resetFocalPoint: true, // At first initilization, center the focal point to the image center
          keepFocalPointPosition: false, // Don't update the focal point as we already set it to the center of the image
          computeFocalPointOffset: true, // Allow to compute the current offset between display reslice center and display focal point
          sphereSources: objItem.sphereSources,
        });
        objItem.renderWindow.render();
      });

      if (view3D) {
        view3D.renderer.resetCamera();
        view3D.renderer.resetCameraClippingRange();
      }
    }
  };

  useEffect(() => {
    if (
      sereisOneRef.current &&
      sereisTwoRef.current &&
      sereisThreeRef.current &&
      series3DRef.current
    ) {
      setup([sereisOneRef, sereisTwoRef, sereisThreeRef, series3DRef]);
    }
  }, [volume]);

  return (
    <StyledSectionView>
      <StyledSereisView className="series-div" ref={sereisOneRef} />
      <StyledSereisView className="series-div" ref={sereisTwoRef} />
      <StyledSereisView className="series-div" ref={sereisThreeRef} />
      <StyledSereisView className="series-div" ref={series3DRef} />
    </StyledSectionView>
  );
};

export { ResliceCursorWidget };
