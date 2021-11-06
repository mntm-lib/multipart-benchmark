import { formParser } from '@mntm/multipart';

export const parse = async (form) => {
  return formParser(form).result;
};
