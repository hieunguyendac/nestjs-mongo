import { extname } from 'path';

export const imageRegex = /\.(jpg|jpeg|jfif|png|gif|svg|webp)$/;
export const pdfRegex = /\.(pdf)$/;

export const editFileName = (req, file: Express.Multer.File, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  callback(null, `${name}-${Date.now()}${fileExtName}`);
};

export const imageFileFilter = (req, file: Express.Multer.File, callback) => {
  if (!file.originalname.match(imageRegex)) {
    return callback(new Error('Không đúng định dạng ảnh'));
  }

  callback(null, true);
};

export const PdfFileFilter = (req, file: Express.Multer.File, callback) => {
  if (!file.originalname.match(pdfRegex)) {
    return callback(new Error('Không đúng định dạng pdf'));
  }

  callback(null, true);
};

export const toResponseFiles = (
  files: Array<Express.Multer.File>,
): Array<Partial<Express.Multer.File>> => {
  const response = [];
  files.forEach((file) => {
    const fileReponse = {
      filename: file.filename,
      minetype: file.mimetype,
    };
    response.push(fileReponse);
  });
  return response;
};

export const toResponseFile = (
  file: Express.Multer.File,
): Partial<Express.Multer.File> => {
  const fileReponse = {
    filename: file.filename,
    minetype: file.mimetype,
  };
  return fileReponse;
};
