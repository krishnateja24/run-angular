import { Component } from '@angular/core';
import { InviteComponent } from './invite/invite.component';
import { YesPageComponent } from './yes-page/yes-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [InviteComponent, YesPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  showYesPage = false;

  onYesClicked(): void {
    this.showYesPage = true;
  }
}
