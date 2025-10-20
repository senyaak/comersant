import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { LobbyService } from 'src/app/modules/lobby/services/lobby.service';

@Component({
  selector: 'app-set-name',
  templateUrl: './set-name.component.html',
  styleUrls: ['./set-name.component.scss'],
  standalone: false,
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

  closeDialog() {
    this.dialog.nativeElement.close();
  }

  disableEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault(); // Prevent the default behavior of the Esc key
    }
  }

  openDialog() {
    this.name = '';
    this.dialog.nativeElement.showModal();
  }

  setName() {
    this.lobbyService.setName(this.name);
    this.closeDialog();
  }
}
