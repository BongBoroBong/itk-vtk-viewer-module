const fs = require('fs');

const basePath = __dirname.replace('\\patch', '');

const cornerstoneImage = '@kitware/vtk.js/Filters/Cornerstone/ImageDataToCornerstoneImage.js';

const filePath = `${basePath}/patch/${cornerstoneImage}`;

const moveFile = (filePath, fileName) => {
  const data = fs.readFileSync(filePath, 'utf-8');
  if (data) {
    const targetPath = `${basePath}/node_modules/${fileName}`;
    fs.writeFileSync(targetPath, data, 'utf8');
    console.log(`${fileName} Move Success`);
  } else {
    console.error('파일이 없습니다.');
  }
};

try {
  moveFile(filePath, cornerstoneImage);
} catch (err) {
  console.error(err);
}
