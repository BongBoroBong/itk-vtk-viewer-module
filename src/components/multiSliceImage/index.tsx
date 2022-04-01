import React, { useEffect, useRef, useState } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/All';

import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import { setInitializeViewer } from '../../utils/common';

const MultiSliceImage = ({ volume }: any) => {
  const sliceRef = useRef<HTMLDivElement>(null);

  const [controlObj, setControlObj] = useState<any>({});
  const [sliceI, setSliceI] = useState(120);
  const [sliceK, setSliceK] = useState(120);
  const [sliceJ, setSliceJ] = useState(120);

  const setup = () => {
    const { objs, images } = setInitializeViewer(sliceRef, volume);

    if (objs.length > 0 && images.length > 0) {
      objs.forEach((obj) => {
        setControlObj(obj);
        images.forEach((image) => {
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
        });
      });
    }
  };

  useEffect(() => {
    if (sliceRef.current) setup();
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
                    controlObj.renderer
                      .getActors()[2]
                      .getMapper()
                      .setISlice(+e.target.value);
                    controlObj.renderWindow.render();
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
                    controlObj.renderer
                      .getActors()[1]
                      .getMapper()
                      .setJSlice(+e.target.value);
                    controlObj.renderWindow.render();
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
                    controlObj.renderer
                      .getActors()[0]
                      .getMapper()
                      .setKSlice(+e.target.value);
                    controlObj.renderWindow.render();
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
