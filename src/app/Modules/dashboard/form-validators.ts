import { FormControl } from '@angular/forms';

export const numberValidator = (c: FormControl) =>
{
  let isDecimal = false;
  if(c.pristine)
  {
    return null;
  }
  const grams: string = c.value;
  for(const n of grams)
  {
    if(n === '.' && !isDecimal && (grams.lastIndexOf(n) !== 0) && (grams.lastIndexOf(n) !== (grams.length - 1)))
    {
      isDecimal = true;
      continue;
    }
    if(isNaN(parseInt(n, 10)))
    {
        return { validateTelephone: { valid: false } };
    }
  }
  return null;
};
