const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');
const workbook = new Excel.Workbook();
const file = process.argv[2] || path.resolve('..','..','ciloa.xlsx');

(async () => {
  await workbook.xlsx.readFile(file);
  for (const ws of workbook.worksheets) {
    console.log('Sheet:', ws.name);
    // images: exceljs stores them in workbook.media and connections via ws.getImages()
    const images = ws.getImages();
    if (!images || images.length === 0) {
      console.log('  No images in sheet');
      continue;
    }
    for (const img of images) {
      const media = workbook.model.media.find(m => m.index === img.imageId);
      // range may be an object with tl/br or a cell key
      const range = img.range || {};
      const tl = (range.tl && range.tl.nativeRow != null) ? `${range.tl.nativeRow}:${range.tl.nativeCol}` : (range.tl ? `${range.tl}` : 'n/a');
      const br = (range.br && range.br.nativeRow != null) ? `${range.br.nativeRow}:${range.br.nativeCol}` : (range.br ? `${range.br}` : 'n/a');
      console.log('  ImageId:', img.imageId, 'range tl=', tl, 'br=', br);
      if (media) {
        const ext = media.type || 'png';
        const outPath = path.resolve(__dirname, '..', '..', `extracted_image_${ws.name}_${img.imageId}.${ext}`);
        fs.writeFileSync(outPath, Buffer.from(media.buffer, 'base64'));
        console.log('   extracted to', outPath);
      }
    }
  }
})();
