import * as multiparty from 'multiparty';

/**
 * @param {import('http').Server} server 
 * @param {(result: any) => void} done
 */
export const handleMultiparty = (server, done) => {
  const handler = (req, res) => {
    const instance = new multiparty.Form();

    const result = {};

    instance.parse(req, (err, fields, files) => {
      Object.assign(result, fields, files);

      res.end(() => {
        done(result);
      });
    });
  };

  server.on('request', handler);

  return () => server.off('request', handler);
};
