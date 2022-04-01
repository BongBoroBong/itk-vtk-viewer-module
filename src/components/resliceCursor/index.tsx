import React, { useEffect, useRef } from 'react';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkResliceCursor from '@kitware/vtk.js/Interaction/Widgets/ResliceCursor/ResliceCursor';
import vtkResliceCursorLineRepresentation from '@kitware/vtk.js/Interaction/Widgets/ResliceCursor/ResliceCursorLineRepresentation';
import vtkResliceCursorWidget from '@kitware/vtk.js/Interaction/Widgets/ResliceCursor/ResliceCursorWidget';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';

const { convertItkToVtkImage } = ITKHelper;

const ResliceCursor = ({ volume }: any) => {
  const sliceRef = useRef<HTMLTableDataCellElement[]>([]);

  const setup = () => {
    let direction = {
      rows: 3,
      columns: 3,
      data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };

    let centerImage = { ...volume.image[0], direction };

    const image = convertItkToVtkImage(centerImage);

    const resliceCursor = vtkResliceCursor.newInstance();
    resliceCursor.setImage(image);

    const renderWindows = [];
    const renderers = [];
    const GLWindows = [];
    const interactors = [];
    const resliceCursorWidgets: any = [];
    const resliceCursorRepresentations = [];

    for (let i = 0; i < sliceRef.current.length; i++) {
      renderWindows[i] = vtkRenderWindow.newInstance();
      renderers[i] = vtkRenderer.newInstance();
      renderers[i].getActiveCamera().setParallelProjection(true);
      renderWindows[i].addRenderer(renderers[i]);

      GLWindows[i] = renderWindows[i].newAPISpecificView('', {});
      GLWindows[i].setContainer(sliceRef.current[i]);
      renderWindows[i].addView(GLWindows[i]);

      interactors[i] = vtkRenderWindowInteractor.newInstance();
      interactors[i].setView(GLWindows[i]);
      interactors[i].initialize();
      interactors[i].bindEvents(sliceRef.current[i]);

      renderWindows[i].setInteractor(interactors[i]);

      resliceCursorWidgets[i] = vtkResliceCursorWidget.newInstance();
      resliceCursorRepresentations[i] = vtkResliceCursorLineRepresentation.newInstance();
      resliceCursorWidgets[i].setWidgetRep(resliceCursorRepresentations[i]);
      resliceCursorRepresentations[i].getReslice().setInputData(image);
      resliceCursorRepresentations[i].getCursorAlgorithm().setResliceCursor(resliceCursor);

      resliceCursorWidgets[i].setInteractor(interactors[i]);
    }

    // X
    resliceCursorRepresentations[0].getCursorAlgorithm().setReslicePlaneNormalToXAxis();

    // Y
    resliceCursorRepresentations[1].getCursorAlgorithm().setReslicePlaneNormalToYAxis();

    // Z
    resliceCursorRepresentations[2].getCursorAlgorithm().setReslicePlaneNormalToZAxis();

    for (let k = 0; k < 3; k++) {
      resliceCursorWidgets[k].onInteractionEvent(() => {
        resliceCursorWidgets[0].render();
        resliceCursorWidgets[1].render();
        resliceCursorWidgets[2].render();
      });
      resliceCursorWidgets[k].setEnabled(true);
      renderers[k].resetCamera();
      renderWindows[k].render();
    }
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <div>
      <table>
        <tr>
          <td ref={(ref) => (sliceRef.current[0] = ref!)} />
          <td ref={(ref) => (sliceRef.current[1] = ref!)} />
        </tr>
        <tr>
          <td ref={(ref) => (sliceRef.current[2] = ref!)} />
        </tr>
      </table>
    </div>
  );
};

export { ResliceCursor };
