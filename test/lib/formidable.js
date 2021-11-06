import { default as formidable } from 'formidable';

export const parse = async (form, boundary) => {
  return new Promise((resolve, reject) => {
    const instance = new formidable.MultipartParser();
    const result = {};

    instance.on('data', ({ name, buffer, start, end }) => {
      if (buffer && start && end) {
        result[name] = buffer.slice(start, end);
      }
    });

    instance.on('error', reject);

    instance.initWithBoundary(boundary.substring(2));
    
    instance.end(form, () => {
      resolve(result);
    });
  });
}

