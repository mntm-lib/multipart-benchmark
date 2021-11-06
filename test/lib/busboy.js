import { Buffer } from 'buffer';
import { default as Busboy } from 'busboy';

/**
 * @param {import('http').Server} server
 * @param {(result: any) => void} done
 */
export const handleBusboy = (server, done) => {
  /**
   * @param {import('http').IncomingMessage} req 
   * @param {import('http').ServerResponse} res 
   */
  const handler = (req, res) => {
    const busboy = new Busboy({
      headers: req.headers
    });

    const result = {};

    // Busboy does not wait for end of reading files
    let files = [];

    busboy.on('file', (name, file, filename, encoding, mime) => {
      const read = new Promise((resolve) => {
        const buffers = [];
        let totalLength = 0;

        file.on('data', (chunk) => {
          totalLength += chunk.length;
          buffers.push(chunk);
        });

        file.on('end', () => {
          result[name] = {
            content: Buffer.concat(buffers, totalLength),
            headers: {
              name,
              filename,
              encoding,
              mime
            }
          };

          resolve();
        })
      });

      files.push(read);
    });

    busboy.on('field', (name, val) => {
      result[name] = {
        content: val,
        headers: {
          name
        }
      };
    });

    busboy.on('finish', () => {
      Promise.all(files).then(() => {
        res.end(() => {
          done(result);
        });
      });
    });

    req.pipe(busboy);
  }

  server.on('request', handler);

  return () => server.off('request', handler);
};
