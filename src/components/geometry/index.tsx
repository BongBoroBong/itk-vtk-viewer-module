import React, { useEffect, useRef, useState } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import { setInitializeViewer } from '../../utils/common';

const GeoMetry = ({ volume }: any) => {
  const vtkContainerRef = useRef<HTMLDivElement | null>(null);
  const context = useRef<any>(null);
  const [coneResolution, setConeResolution] = useState(6);
  const [representation, setRepresentation] = useState(2);

  useEffect(() => {
    if (!context.current) {
      const { objs, images } = setInitializeViewer(vtkContainerRef, volume);

      if (objs.length > 0 && images.length > 0) {
        objs.forEach((obj) => {
          const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
            // @ts-ignore
            rootContainer: vtkContainerRef.current,
          });

          obj.renderer = fullScreenRenderWindow.getRenderer();
          obj.renderWindow = fullScreenRenderWindow.getRenderWindow();
          obj.renderWindow.getInteractor().setDesiredUpdateRate(15);

          images.forEach((image) => {});
        });
      }

      // const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      //   // @ts-ignore
      //   rootContainer: vtkContainerRef.current,
      // });
      // const coneSource = vtkConeSource.newInstance({ height: 2.0 });
      //
      // const mapper = vtkMapper.newInstance();
      // mapper.setInputConnection(coneSource.getOutputPort());
      //
      // const actor = vtkActor.newInstance();
      // actor.setMapper(mapper);
      //
      // const renderer = fullScreenRenderer.getRenderer();
      // const renderWindow = fullScreenRenderer.getRenderWindow();
      //
      // renderer.addActor(actor);
      // renderer.resetCamera();
      // renderWindow.render();
      //
      // context.current = {
      //   fullScreenRenderer,
      //   renderWindow,
      //   renderer,
      //   coneSource,
      //   actor,
      //   mapper,
      // };
    }

    return () => {
      if (context.current) {
        const { fullScreenRenderer, coneSource, actor, mapper } = context.current;
        actor.delete();
        mapper.delete();
        coneSource.delete();
        fullScreenRenderer.delete();
        context.current = null;
      }
    };
  }, [vtkContainerRef]);

  useEffect(() => {
    if (context.current) {
      const { coneSource, renderWindow } = context.current;
      coneSource.setResolution(coneResolution);
      renderWindow.render();
    }
  }, [coneResolution]);

  useEffect(() => {
    if (context.current) {
      const { actor, renderWindow } = context.current;
      actor.getProperty().setRepresentation(representation);
      renderWindow.render();
    }
  }, [representation]);

  return (
    <div>
      <div ref={vtkContainerRef} />
      <table
        style={{
          position: 'absolute',
          top: '25px',
          left: '25px',
          background: 'white',
          padding: '12px',
        }}
      >
        <tbody>
          <tr>
            <td>
              <select
                value={representation}
                style={{ width: '100%' }}
                onChange={(ev) => setRepresentation(+ev.target.value)}
              >
                <option value="0">Points</option>
                <option value="1">Wireframe</option>
                <option value="2">Surface</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <input
                type="range"
                min="4"
                max="80"
                value={coneResolution}
                onChange={(ev) => setConeResolution(Number(ev.target.value))}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { GeoMetry };