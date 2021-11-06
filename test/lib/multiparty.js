import { EventEmitter } from 'events';

import * as multiparty from 'multiparty';

const emitter = Object.assign(new EventEmitter(), {
  readable: true,
  resume() {
    // stub
  },
  pipe() {
    // stub
  },
  headers: {
    // stub
    'content-type': ''
  }
});

export const parse = async (form, boundary) => {
  return new Promise((resolve, reject) => {
    const instance = new multiparty.Form();
    const result = {};

    instance.on('error', reject);

    instance.on('field', (name, value) => {
      result[name] = value;
    });

    instance.on('close', () => {
      resolve(result);
    });
    
    emitter.headers['content-type'] = 'multipart/form-data; boundary=--' + boundary;
    emitter.pipe = () => {
      instance._write(form, null, () => {
        emitter.emit('end');
      });
    };

    instance.parse(emitter);
  });
}
