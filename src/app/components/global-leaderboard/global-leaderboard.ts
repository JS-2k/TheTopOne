import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { Bid } from '../../models/bid.model';

@Component({
  selector: 'app-global-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute bottom-6 left-6 z-20 w-80 bg-black/80 backdrop-blur-xl border border-[#1effc8]/20 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto transition-transform duration-300"
         [class.translate-y-[120%]]="!isOpen()" [class.hover:border-[#1effc8]/50]="isOpen()">
      
      <!-- Top Bar Toggle -->
      <div class="w-full bg-white/5 px-4 py-3 cursor-pointer flex justify-between items-center" (click)="toggle()">
        <div class="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#1effc8]"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>
          <span class="text-white font-black text-xs tracking-widest uppercase">Global Top One</span>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.rotate-180]="isOpen()" class="text-zinc-500 transition-transform">
          <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="p-4 flex-1 h-[250px] overflow-y-auto custom-scrollbar" *ngIf="isOpen()">
        <h4 class="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4">Highest Bids (All Regions)</h4>
        
        <div class="flex flex-col gap-3">
          <div *ngFor="let leader of topLeaders(); let i = index" 
               class="flex items-center gap-3 bg-white/5 border rounded-xl p-3 hover:bg-white/10 cursor-pointer transition-colors"
               [ngClass]="i === 0 ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-500/10 to-transparent shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'border-white/5'"
               (click)="selectCountry(leader.countryId)">
            
            <ng-container *ngIf="i === 0">
               <div class="relative w-max mr-1">
                  <div class="absolute inset-0 bg-yellow-400 blur-[8px] opacity-60 rounded-full"></div>
                  <div class="relative bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-600 text-black border border-yellow-100 shadow-[0_0_10px_rgba(250,204,21,0.5)] px-1.5 py-1 flex items-center flex-col justify-center rounded-lg min-w-[45px]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="mb-0.5 mt-0.5">
                        <path d="M4 14l2-8 3 4 3-6 3 6 3-4 2 8H4z"/>
                        <rect x="4" y="16" width="16" height="2"/>
                    </svg>
                    <span class="text-[7px] font-black uppercase tracking-widest leading-tight text-center">The Top<br>One</span>
                  </div>
               </div>
            </ng-container>

            <ng-container *ngIf="i > 0">
               <div class="min-w-[45px] text-center text-xl font-black mr-1" [ngClass]="{'text-zinc-300': i===1, 'text-amber-700': i===2}">
                 {{ i + 1 }}
               </div>
            </ng-container>

            <img *ngIf="leader.owner.avatarUrl" [src]="leader.owner.avatarUrl" class="w-8 h-8 rounded-full border border-white/20 object-cover bg-zinc-800">
            <div *ngIf="!leader.owner.avatarUrl" class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-zinc-800 text-white font-bold text-xs uppercase">{{ leader.owner.name.charAt(0) }}</div>
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-bold text-white truncate">{{ leader.owner.name }}</div>
              <div class="text-[10px] text-zinc-400 uppercase tracking-widest truncate">{{ leader.countryId }}</div>
            </div>
            <div class="text-[13px] font-black" [ngClass]="i === 0 ? 'text-yellow-400' : 'text-[#1effc8]'">\${{ leader.owner.amount }}</div>
          </div>

          <div *ngIf="topLeaders().length === 0" class="text-center py-6 text-zinc-500 text-xs italic">
            No bids placed across the map yet.
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle button when closed -->
    <button *ngIf="!isOpen()" (click)="toggle()"
      class="absolute bottom-6 left-6 z-20 pointer-events-auto bg-black/80 backdrop-blur-xl border border-[#1effc8]/30 px-5 py-3 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(30,255,200,0.15)] hover:bg-black hover:scale-105 transition-all text-[#1effc8]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>
      <span class="font-black text-xs tracking-widest uppercase">Global Target</span>
    </button>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(30,255,200,0.3); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(30,255,200,0.6); }
  `]
})
export class GlobalLeaderboardComponent {
  private mapService = inject(MapService);

  isOpen = signal(true);

  topLeaders = computed(() => {
    const ownership = this.mapService.ownershipInfo();
    const leaders: { countryId: string, owner: Bid }[] = [];

    ownership.forEach((data, id) => {
      if (data.currentOwner) {
        leaders.push({ countryId: id, owner: data.currentOwner });
      }
    });

    return leaders.sort((a, b) => b.owner.amount - a.owner.amount).slice(0, 3);
  });

  toggle() {
    this.isOpen.update(v => !v);
  }

  selectCountry(countryId: string) {
    this.mapService.selectCountry(countryId);
  }
}
