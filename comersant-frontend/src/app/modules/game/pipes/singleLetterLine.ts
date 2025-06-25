import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'splitLetters',
  standalone: false,
})
export class SplitLetters implements PipeTransform {
  transform(value: string): string[] {
    return value.split('');
  }
}
