import { EventEmitter } from 'events';

import { default as Busboy } from 'busboy';

const emitter = Object.assign(new EventEmitter(), {
  pipe() {
    // stub
  }
});

export const parse = async (form, boundary) => {
  return new Promise((resolve, reject) => {
    const instance = new Busboy({
      headers: {
        'content-type': 'multipart/form-data; boundary=--' + boundary
      }
    });

    const result = {};

    instance.on('error', (ex) => {
      console.log('error', ext);

      reject(ex);
    });

    instance.on('field', (name, value) => {
      console.log('field', name, value);

      result[name] = value;
    });

    instance.on('finish', () => {
      console.log('finish', result);

      resolve(result);
    });
    
    emitter.pipe = () => {
      console.log('pipe');

      instance._write(form, null, () => {
        console.log('end');

        emitter.emit('end');
      });
    };
  });
}
