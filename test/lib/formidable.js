import { default as formidable } from 'formidable';

/**
 * @param {import('http').Server} server 
 * @param {(result: any) => void} done
 */
export const handleFormidable = (server, done) => {
  /**
   * @param {import('http').IncomingMessage} req 
   * @param {import('http').ServerResponse} res 
   */
  const handler = (req, res) => {
    const instance = formidable.formidable();

    const result = {};

    instance.parse(req, (err, fields, files) => {
      Object.assign(result, fields, files);

      res.end(() => {
        done(result);
      });
    });
  }

  server.on('request', handler);

  return () => server.off('request', handler);
};
