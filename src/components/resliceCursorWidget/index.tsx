import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
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

const StyledSereisView = styled.div`
  width: min(calc(50vh - 35px), 800px);
  min-width: 400px;
  min-height: 400px;
`;

const ResliceCursorWidget = ({ volume }: any) => {
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
      renderer: null,
      resetFocalPoint: false, // Reset the focal point to the center of the display image
      keepFocalPointPosition: false, // Defines if the focal point position is kepts (same display distance from reslice cursor center)
      computeFocalPointOffset: false, // Defines if the display offset between reslice center and focal point has to be
      // computed. If so, then this offset will be used to keep the focal point position during rotation.
      spheres: null,
    },
  ) {
    const obj = widget.updateReslicePlane(interactionContext.reslice, interactionContext.viewType);
    if (obj.modified) {
      interactionContext.actor.setUserMatrix(interactionContext.reslice.getResliceAxes());
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
    const widgetState = widget.getWidgetState();
    widgetState.setKeepOrthogonality(true);
    widgetState.setOpacity(0.6);
    widgetState.setSphereRadius(10);
    widgetState.setLineThickness(5);

    let direction = {
      rows: 3,
      columns: 3,
      data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };

    let centerImage = { ...volume.image, direction };

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

      obj.reslice = vtkImageReslice.newInstance();
      obj.reslice.setSlabMode(SlabMode.MEAN);
      obj.reslice.setSlabNumberOfSlices(1);
      obj.reslice.setTransformInputSampling(false);
      obj.reslice.setAutoCropOutput(true);
      obj.reslice.setOutputDimensionality(2);
      obj.resliceMapper = vtkImageMapper.newInstance();
      obj.resliceActor = vtkImageSlice.newInstance();
      obj.resliceActor.setMapper(obj.resliceMapper);
      obj.resliceMapper.setInputConnection(obj.reslice.getOutputPort());
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

      const image = convertItkToVtkImage(centerImage);

      widget.setImage(image);

      // Create image outline in 3D view
      const outline: any = vtkOutlineFilter.newInstance();
      outline.setInputData(image);
      const outlineMapper = vtkMapper.newInstance();
      outlineMapper.setInputData(outline.getOutputData());
      const outlineActor = vtkActor.newInstance();
      outlineActor.setMapper(outlineMapper);

      view3D && view3D.renderer.addActor(outlineActor);

      viewAttributes.forEach((obj, i) => {
        obj.reslice.setInputData(image);
        obj.renderer.addActor(obj.resliceActor);
        view3D && view3D.renderer.addActor(obj.resliceActor);
        obj.sphereActors.forEach((actor: any) => {
          obj.renderer.addActor(actor);
          view3D && view3D.renderer.addActor(actor);
        });

        const reslice = obj.reslice;
        const viewType = xyzToViewType[i];

        viewAttributes.forEach((v) => {
          v.widgetInstance.onInteractionEvent(
            ({ computeFocalPointOffset, canUpdateFocalPoint }: any) => {
              const activeViewType = widget.getWidgetState().getActiveViewType();
              const keepFocalPointPosition = activeViewType !== viewType && canUpdateFocalPoint;
              updateReslice({
                viewType,
                reslice,
                actor: obj.resliceActor,
                renderer: obj.renderer,
                resetFocalPoint: false,
                keepFocalPointPosition,
                computeFocalPointOffset,
                sphereSources: obj.sphereSources,
              });
            },
          );
        });

        updateReslice({
          viewType,
          reslice,
          actor: obj.resliceActor,
          renderer: obj.renderer,
          resetFocalPoint: true, // At first initilization, center the focal point to the image center
          keepFocalPointPosition: false, // Don't update the focal point as we already set it to the center of the image
          computeFocalPointOffset: true, // Allow to compute the current offset between display reslice center and display focal point
          sphereSources: obj.sphereSources,
        });
        obj.renderWindow.render();
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
    <section>
      <StyledSereisView className="series-div" ref={sereisOneRef} />
      <StyledSereisView className="series-div" ref={sereisTwoRef} />
      <StyledSereisView className="series-div" ref={sereisThreeRef} />
      <StyledSereisView className="series-div" ref={series3DRef} />
    </section>
  );
};

export { ResliceCursorWidget };
