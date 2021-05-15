import crypto from 'crypto';

export const randomToken = (
  bytes = 48,
  encoding: BufferEncoding = 'base64',
): Promise<string> =>
  new Promise((resolve) =>
    crypto.randomBytes(bytes, (err, buffer) =>
      resolve(buffer.toString(encoding)),
    ),
  );

export const randomUrlSafeToken = async (bytes?: number): Promise<string> => {
  const rand = await randomToken(bytes);
  return rand.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
};
