import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage'
})
export class PercentagePipe implements PipeTransform {

  transform(value: string, calories: string = '3000'): number
  {
    return value ? parseFloat(((parseFloat(value)) * 100 / parseFloat(calories)).toFixed(2)) : 0;
  }

}
