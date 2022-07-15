import * as bcryptjs from 'bcryptjs';
import { format } from 'date-fns';
export const hashPassword = async (password: string) => {
  const saltOrRounds = 10;
  const hash = await bcryptjs.hash(password, saltOrRounds);
  return hash;
};

export const generateFromDate = (fromDate: Date) => {
  const result = format(fromDate, 'yyyy-MM-dd');
  return result + ' 00:00:00';
};

export const generateToDate = (toDate: Date) => {
  const result = format(toDate, 'yyyy-MM-dd');
  return result + ' 23:59:00';
};
