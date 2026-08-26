import { Component, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [RouterLink, CommonModule],
  standalone: true
})
export class HeaderComponent {
  // Simulating active visitors to gamify the prestige of the platform
  visitors = signal(Math.floor(Math.random() * 950) + 12);

  constructor() {
    setInterval(() => {
      // Randomly fluctuate visitors to seem organic
      const diff = Math.floor(Math.random() * 5) - 1; // +3 to -1 occasionally
      this.visitors.update(v => {
        let next = v + diff;
        if (next < 1) next = 1;
        if (next > 999) next = 999;
        return next;
      });
    }, 4000);
  }
}
