import React, { useRef } from 'react';
import readImageFile from 'itk/readImageFile';
import readImageDICOMFileSeries from 'itk/readImageDICOMFileSeries';
import readMeshFile from 'itk/readMeshFile';
import readPolyDataFile from 'itk/readPolyDataFile';
import runPipelineBrowser from 'itk/runPipelineBrowser';
import IOTypes from 'itk/IOTypes';
import getFileExtension from 'itk/getFileExtension';
import extensionToMeshIO from 'itk/extensionToMeshIO';
import extensionToPolyDataIO from 'itk/extensionToPolyDataIO';
import { readAsArrayBuffer } from 'promise-file-reader';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtk from '@kitware/vtk.js/vtk';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';

interface DataimportProps {
  callback: (data: any) => void;
  accept?: string;
}

const DataImport = ({ callback, accept = '.dcm, .nii, .vtp' }: DataimportProps) => {
  const dcmFileUploader = useRef<HTMLInputElement | null>(null);

  const readFiles = async (files: FileList) => {
    try {
      const { image: itkImage } = await readImageDICOMFileSeries(files);
      itkImage.name = files[0].name;
      return {
        image: [itkImage],
      };
    } catch (error) {
      const readers = Array.from(files).map(async (file) => {
        const extension = getFileExtension(file.name);
        if (extension === 'vti') {
          return readAsArrayBuffer(file).then((fileContents) => {
            const vtiReader = vtkXMLImageDataReader.newInstance();
            vtiReader.parseAsArrayBuffer(fileContents);
            const vtkImage = vtiReader.getOutputData(0);
            const itkImage = vtkITKHelper.convertVtkToItkImage(vtkImage);
            return Promise.resolve({
              data: itkImage,
              vtkImage: vtkImage,
            });
          });
        } else if (extension === 'vtp') {
          return readAsArrayBuffer(file).then((fileContents) => {
            const vtpReader = vtkXMLPolyDataReader.newInstance();
            vtpReader.parseAsArrayBuffer(fileContents);
            const vtkImage = vtpReader.getOutputData(0);
            return Promise.resolve({
              data: vtkImage,
              vtkImage: vtkImage,
            });
          });
        } else if (extensionToPolyDataIO.has(extension)) {
          return readPolyDataFile(null, file)
            .then(({ polyData, webWorker }: any) => {
              webWorker.terminate();
              return Promise.resolve({ data: vtk(polyData) });
            })
            .catch((error: any) => {
              return Promise.reject(error);
            });
        } else if (extensionToMeshIO.has(extension)) {
          return readMeshFile(null, file)
            .then(({ mesh: itkMesh, webWorker }: any) => {
              webWorker.terminate();
              const pipelinePath = 'MeshToPolyData';
              const args = ['mesh.json', 'polyData.json'];
              const desiredOutputs = [{ path: args[1], type: IOTypes.vtkPolyData }];
              const inputs = [{ path: args[0], type: IOTypes.Mesh, data: itkMesh }];
              return runPipelineBrowser(null, pipelinePath, args, desiredOutputs, inputs);
            })
            .then(function ({ outputs, webWorker }: any) {
              webWorker.terminate();
              return Promise.resolve({ data: vtk(outputs[0].data) });
            })
            .catch(() => {
              return readImageFile(null, file)
                .then(({ image: itkImage, webWorker }: any) => {
                  webWorker.terminate();
                  return Promise.resolve({ data: itkImage });
                })
                .catch((error: any) => {
                  return Promise.reject(error);
                });
            });
        }
        const { image: itkImage, webWorker } = await readImageFile(null, file);
        itkImage.name = file.name;
        webWorker.terminate();
        return { data: itkImage };
      });
      const dataSets = await Promise.all(readers);
      const images = dataSets
        .filter(({ data }) => !!data && data.imageType !== undefined)
        .map(({ data }) => data);

      return {
        image: images,
      };
    }
  };

  const handleButton = () => {
    if (dcmFileUploader.current) {
      dcmFileUploader.current.click();
    }
  };

  const handleChange = async (e: any) => {
    try {
      const files = e.target.files || e.dataTransfer.files;
      callback(await readFiles(files));
    } catch (e) {
      console.log('error', e);
    }
  };

  return (
    <div>
      <input
        ref={dcmFileUploader}
        type="file"
        id="dicom-file-uploader"
        style={{ display: 'none' }}
        accept={accept}
        multiple
        onChange={handleChange}
      />
      <div onClick={handleButton}>Data import</div>
    </div>
  );
};

export { DataImport };
