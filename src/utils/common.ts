import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';

const { convertItkToVtkImage } = ITKHelper;

export const setInitializeViewer = (refs: any, volume: any) => {
  const objs: any[] = [];
  const images: any[] = [];

  const setObjs = (ref: any, index: number) => {
    const grw = vtkGenericRenderWindow.newInstance();
    grw.setContainer(ref);
    grw.resize();

    const obj = {
      renderWindow: grw.getRenderWindow(),
      renderer: grw.getRenderer(),
      GLWindow: grw.getOpenGLRenderWindow(),
      interactor: grw.getInteractor(),
      index,
    };
    obj.renderWindow.addRenderer(obj.renderer);
    obj.renderWindow.addView(obj.GLWindow);
    obj.renderWindow.setInteractor(obj.interactor);

    objs.push(obj);
  };

  const setImages = (volume: any) => {
    let direction = {
      rows: 3,
      columns: 3,
      data: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };

    if (Array.isArray(volume.image)) {
      volume.image.forEach((volumeImage: any, i: number) => {
        let centerImage = { ...volumeImage, direction };
        let image = convertItkToVtkImage(centerImage);
        image.index = i;
        images.push(image);
      });
    } else {
      let centerImage = { ...volume.image, direction };
      let image = convertItkToVtkImage(centerImage);
      image.index = 0;
      images.push(image);
    }
  };

  if (Array.isArray(refs.current)) {
    refs.current.forEach((ref: any, i: number) => {
      setObjs(ref, i);
    });
  } else {
    setObjs(refs.current, 0);
  }
  setImages(volume);

  return { objs, images };
};
