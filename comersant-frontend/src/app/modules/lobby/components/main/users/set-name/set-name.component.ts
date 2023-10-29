import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { LobbyService } from 'src/app/modules/lobby/services/lobby.service';

@Component({
  selector: 'app-set-name',
  templateUrl: './set-name.component.html',
  styleUrls: ['./set-name.component.scss'],
})
export class SetNameComponent implements AfterViewInit {
  @ViewChild('setNameDialog') dialog!: ElementRef;
  name = '';

  constructor(private readonly lobbyService: LobbyService) {}

  ngAfterViewInit(): void {
    if (!this.lobbyService.Name) {
      this.openDialog();
    }
  }

  openDialog() {
    this.name = '';
    this.dialog.nativeElement.showModal();
  }

  closeDialog() {
    this.dialog.nativeElement.close();
  }

  setName() {
    this.lobbyService.setName(this.name);
    this.closeDialog();
  }

  disableEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault(); // Prevent the default behavior of the Esc key
    }
  }
}
