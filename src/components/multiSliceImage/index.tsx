import React, { useEffect, useRef, useState } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';

const { convertItkToVtkImage } = ITKHelper;

const grw = vtkGenericRenderWindow.newInstance();
const obj: any = {
  renderWindow: grw.getRenderWindow(),
  renderer: grw.getRenderer(),
  GLWindow: grw.getOpenGLRenderWindow(),
};

const MultiSliceImage = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const [sliceI, setSliceI] = useState(120);
  const [sliceK, setSliceK] = useState(120);
  const [sliceJ, setSliceJ] = useState(120);

  const setup = (refs: any) => {
    if (Array.isArray(volume.image)) {
      grw.setContainer(refs.current);
      grw.resize();

      obj.renderWindow.addRenderer(obj.renderer);
      obj.renderWindow.addView(obj.GLWindow);

      let direction = {
        rows: 3,
        columns: 3,
        data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      };

      for (let i = 0; i < volume.image.length; i++) {
        let centerImage = { ...volume.image[i], direction };
        const image = convertItkToVtkImage(centerImage);

        const imageActorI = vtkImageSlice.newInstance();
        const imageActorJ = vtkImageSlice.newInstance();
        const imageActorK = vtkImageSlice.newInstance();

        obj.renderer.addActor(imageActorK);
        obj.renderer.addActor(imageActorJ);
        obj.renderer.addActor(imageActorI);

        const imageMapperK = vtkImageMapper.newInstance();
        imageMapperK.setInputData(image);
        imageMapperK.setKSlice(sliceK);
        // @ts-ignore
        imageActorK.setMapper(imageMapperK);
        const imageMapperJ = vtkImageMapper.newInstance();
        imageMapperJ.setInputData(image);
        imageMapperJ.setJSlice(sliceJ);
        // @ts-ignore
        imageActorJ.setMapper(imageMapperJ);
        const imageMapperI = vtkImageMapper.newInstance();
        imageMapperI.setInputData(image);
        imageMapperI.setISlice(sliceI);
        // @ts-ignore
        imageActorI.setMapper(imageMapperI);

        obj.renderer.resetCamera();
        obj.renderer.resetCameraClippingRange();
        obj.renderWindow.render();
      }
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup(sliceRef);
  }, [volume]);

  return (
    <div>
      <div ref={sliceRef} />
      <div
        style={{
          position: 'absolute',
          left: '40px',
          top: '40px',
          backgroundColor: 'white',
          borderRadius: '5px',
        }}
      >
        <table>
          <tbody>
            <tr>
              <td>Slice I</td>
              <td>
                <input
                  key="slice-i"
                  type="range"
                  min="0"
                  max="300"
                  step="1"
                  defaultValue={sliceI}
                  onChange={(e) => {
                    setSliceI(+e.target.value);
                    obj.renderer
                      .getActors()[2]
                      .getMapper()
                      .setISlice(+e.target.value);
                    obj.renderWindow.render();
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Slice J</td>
              <td>
                <input
                  key="slice-j"
                  type="range"
                  min="0"
                  max="300"
                  step="1"
                  defaultValue={sliceJ}
                  onChange={(e) => {
                    setSliceJ(+e.target.value);
                    obj.renderer
                      .getActors()[1]
                      .getMapper()
                      .setJSlice(+e.target.value);
                    obj.renderWindow.render();
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>Slice K</td>
              <td>
                <input
                  key="slice-k"
                  type="range"
                  min="0"
                  max="300"
                  step="1"
                  defaultValue={sliceK}
                  onChange={(e) => {
                    setSliceK(+e.target.value);
                    obj.renderer
                      .getActors()[0]
                      .getMapper()
                      .setKSlice(+e.target.value);
                    obj.renderWindow.render();
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { MultiSliceImage };
