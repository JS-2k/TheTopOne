import { Component } from '@angular/core';
import { WorldMapComponent } from '../world-map/world-map';
import { SidePanelComponent } from '../side-panel/side-panel';
import { ProfileModalComponent } from '../profile-modal/profile-modal';
import { GlobalLeaderboardComponent } from '../global-leaderboard/global-leaderboard';
import { VictoryModalComponent } from '../victory-modal/victory-modal';

@Component({
  selector: 'app-home',
  imports: [WorldMapComponent, SidePanelComponent, ProfileModalComponent, GlobalLeaderboardComponent, VictoryModalComponent],
  template: `
    <main class="relative w-full h-full bg-transparent overflow-hidden flex flex-col">
      <!-- Title/Hero text for map -->
      <div class="absolute top-10 left-10 z-10 pointer-events-none drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <h1 class="text-3xl md:text-5xl font-black tracking-tighter mb-2 uppercase">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Who's </span>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">#1</span>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-white/70 to-white/40"> Among<br>The Elite?</span>
        </h1>
        <p class="text-[#1effc8] font-mono text-[10px] md:text-sm tracking-[0.3em] uppercase">Global Public Leaderboard</p>
      </div>

      <!-- The Core Experience -->
      <div class="flex-1 w-full relative min-h-0">
        <app-world-map class="absolute inset-0 block"></app-world-map>
      </div>
      <app-side-panel></app-side-panel>
      <app-profile-modal></app-profile-modal>
      <app-global-leaderboard></app-global-leaderboard>
      <app-victory-modal></app-victory-modal>
    </main>
  `,
  standalone: true
})
export class HomeComponent { }
