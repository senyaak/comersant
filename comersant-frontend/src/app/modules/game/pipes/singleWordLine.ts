import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'split',
  standalone: false,
})
export class Split implements PipeTransform {
  transform(value: string): string[] {
    return value.split(' ');
  }
}
