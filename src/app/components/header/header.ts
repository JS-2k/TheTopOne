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
  visitors = signal(14023);

  constructor() {
    setInterval(() => {
      // Randomly fluctuate visitors to seem organic
      const diff = Math.floor(Math.random() * 5) - 1;
      this.visitors.update(v => v + diff);
    }, 4000);
  }
}
