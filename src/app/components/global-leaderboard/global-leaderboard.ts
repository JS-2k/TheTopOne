import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { Bid } from '../../models/bid.model';

@Component({
  selector: 'app-global-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute bottom-6 left-6 z-20 w-[340px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
         [class.translate-y-[120%]]="!isOpen()" [class.opacity-0]="!isOpen()" [class.hover:border-white/10]="isOpen()">
      
      <!-- Top Bar Toggle -->
      <div class="w-full px-5 py-4 cursor-pointer flex justify-between items-center relative overflow-hidden group" (click)="toggle()">
        <!-- Shimmer effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        
        <div class="flex items-center gap-3 relative z-10">
          <div class="w-2 h-2 rounded-full bg-[#1effc8] shadow-[0_0_10px_#1effc8] animate-pulse"></div>
          <span class="text-white font-black text-xs tracking-[0.3em] uppercase">Global Top 3</span>
        </div>
        <button class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-400">
            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="px-5 pb-5 flex flex-col gap-3 relative" *ngIf="isOpen()">
        <!-- Subtle separator -->
        <div class="absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div *ngFor="let leader of topLeaders(); let i = index" 
             class="relative group rounded-2xl p-[1px] transition-all duration-300 cursor-pointer overflow-hidden"
             [ngClass]="i === 0 ? 'mt-2' : ''"
             (click)="selectCountry(leader.countryId)">
          
          <!-- Animated Border Gradient for #1 -->
          <div *ngIf="i === 0" class="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div *ngIf="i > 0" class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>

          <!-- Card Content -->
          <div class="relative w-full h-full bg-[#111] rounded-[15px] p-3 flex items-center gap-4 border border-transparent"
               [ngClass]="i === 0 ? 'bg-gradient-to-b from-[#1a1500] to-[#0a0a0a]' : ''">
               
            <!-- Rank Badge -->
            <div class="flex flex-col items-center justify-center min-w-[32px]">
              <ng-container *ngIf="i === 0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#goldGrad)" class="drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fef08a"/>
                      <stop offset="50%" stop-color="#eab308"/>
                      <stop offset="100%" stop-color="#b45309"/>
                    </linearGradient>
                  </defs>
                  <path d="M4 14l2-8 3 4 3-6 3 6 3-4 2 8H4z"/>
                  <rect x="4" y="16" width="16" height="2"/>
                </svg>
              </ng-container>
              <ng-container *ngIf="i === 1">
                <span class="text-xl font-black text-zinc-300 drop-shadow-[0_0_5px_rgba(212,212,216,0.5)]">2</span>
              </ng-container>
              <ng-container *ngIf="i === 2">
                <span class="text-xl font-black text-amber-700 drop-shadow-[0_0_5px_rgba(180,83,9,0.5)]">3</span>
              </ng-container>
            </div>

            <!-- Avatar -->
            <div class="relative">
              <div *ngIf="i === 0" class="absolute inset-0 bg-yellow-400 blur-md opacity-20 rounded-full"></div>
              <img *ngIf="leader.owner.avatarUrl" [src]="leader.owner.avatarUrl" 
                   class="relative rounded-full object-cover bg-zinc-800"
                   [ngClass]="i === 0 ? 'w-11 h-11 border-2 border-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'w-9 h-9 border border-white/20'">
              <div *ngIf="!leader.owner.avatarUrl" 
                   class="relative rounded-full flex items-center justify-center bg-zinc-800 text-white font-bold uppercase"
                   [ngClass]="i === 0 ? 'w-11 h-11 border-2 border-yellow-400 text-lg shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'w-9 h-9 border border-white/20 text-sm'">
                   {{ leader.owner.name.charAt(0) }}
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <div *ngIf="i === 0" class="mb-1"><span class="inline-block text-[8px] font-black uppercase tracking-[0.1em] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded outline outline-1 outline-yellow-400/20 leading-none">The Top One</span></div>
              <div class="font-bold text-white truncate leading-tight" [ngClass]="i === 0 ? 'text-[15px]' : 'text-sm'">{{ leader.owner.name }}</div>
              <div class="text-[9px] text-zinc-400 uppercase tracking-widest truncate mt-0.5">{{ leader.countryId }}</div>
            </div>

            <!-- Bid Amount -->
            <div class="text-right flex flex-col justify-center">
              <div class="font-black" [ngClass]="i === 0 ? 'text-lg text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-sm text-[#1effc8]'">\${{ leader.owner.amount }}</div>
            </div>
            
          </div>
        </div>

        <div *ngIf="topLeaders().length === 0" class="text-center py-8 text-zinc-500 text-xs italic bg-white/5 rounded-2xl border border-white/5">
          No leaders established yet.
        </div>
      </div>
    </div>

    <!-- Toggle button when closed -->
    <button *ngIf="!isOpen()" (click)="toggle()"
      class="absolute bottom-6 left-6 z-20 pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#1effc8]/30 px-5 py-3 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(30,255,200,0.15)] hover:bg-black hover:scale-105 hover:border-[#1effc8]/60 transition-all text-[#1effc8] group">
      <div class="relative w-4 h-4 flex items-center justify-center">
         <div class="absolute inset-0 bg-[#1effc8] rounded-full blur-[6px] opacity-40 group-hover:opacity-80 transition-opacity"></div>
         <div class="w-2 h-2 rounded-full bg-[#1effc8]"></div>
      </div>
      <span class="font-black text-[11px] tracking-[0.2em] uppercase">Open Podium</span>
    </button>
  `,
  styles: [`
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
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
