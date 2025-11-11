import { Component } from '@angular/core';

import { BaseComponent } from '../../abstract/base';

@Component({
  selector: '[app-move-to-center]',
  templateUrl: './move-to-center.component.html',
  styleUrl: './move-to-center.component.scss',
  standalone: false,
})
export class MoveToCenterComponent extends BaseComponent {
  get words(): string[] {
    return $localize`:@@centerEntrance:Entrance to the Center`.split(' ');
  }
}
