import { formParser } from '@mntm/multipart';

/**
 * @param {import('http').Server} server 
 * @param {(result: any) => void} done
 */
export const handleMultipart = (server, done) => {
  /**
   * @param {import('http').IncomingMessage} req 
   * @param {import('http').ServerResponse} res 
   */
  const handler = async (req, res) => {
    const buffers = [];
    let totalLength = 0;

    for await (const chunk of req) {
      totalLength += chunk.length;
      buffers.push(chunk);
    }

    const result = formParser(Buffer.concat(buffers, totalLength)).result;

    res.end(() => {
      done(result);
    });
  };

  server.on('request', handler);

  return () => server.off('request', handler);
};
