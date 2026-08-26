import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';

@Component({
    selector: 'app-victory-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="mapService.victorySignal() as victory" 
         class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      
      <!-- Overlay click to close -->
      <div class="fixed inset-0 cursor-pointer" (click)="closeModal()"></div>

      <div class="relative z-10 w-full max-w-md bg-zinc-950/90 border-2 border-[#1effc8]/50 p-8 shadow-[0_0_80px_rgba(30,255,200,0.3)] animate-in zoom-in-[0.95] duration-400 rounded-3xl overflow-hidden">
        
        <!-- Animated border effects -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-[#1effc8] rounded-full blur-[80px] opacity-20 pointer-events-none animate-pulse"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500 rounded-full blur-[80px] opacity-20 pointer-events-none animate-pulse" style="animation-delay: 1s;"></div>
        
        <button (click)="closeModal()"
          class="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-[#1effc8]/20 rounded-full transition-all z-30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="text-center relative z-20 flex flex-col items-center">
          <div class="text-[12px] font-black text-white/50 tracking-[0.4em] mb-2">THE TOP ONE</div>
          
          <div class="text-5xl my-4">🔥</div>

          <h2 class="text-4xl font-black text-white tracking-widest uppercase mb-4 leading-none">
            I'M #1 IN <br><span class="text-[#1effc8] underline decoration-4 underline-offset-8 drop-shadow-md">{{ victory.countryId }}</span>
          </h2>
          
          <div class="bg-black/50 border border-white/10 rounded-xl px-6 py-4 w-full mb-6">
            <div class="text-2xl font-black text-[#1effc8] mb-1">\${{ victory.bid.amount | number }} BID</div>
            <div class="text-white/80 italic font-medium">"{{ victory.bid.message || 'Who is going to beat me?' }}"</div>
          </div>
          
          <div class="text-xs font-bold text-white/30 tracking-[0.2em] mb-6">THETOPONE.COM</div>

          <button (click)="shareVictory()"
            class="w-full bg-[#1effc8] text-black py-4 text-[15px] font-black tracking-widest uppercase hover:bg-white hover:scale-105 hover:shadow-[0_0_30px_rgba(30,255,200,0.6)] transition-all rounded-xl focus:outline-none flex gap-3 justify-center items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Share Your Victory
          </button>
        </div>
      </div>
    </div>
  `
})
export class VictoryModalComponent {
    mapService = inject(MapService);

    closeModal() {
        this.mapService.clearVictory();
    }

    shareVictory() {
        // Simulated share
        alert('Victory card copied to clipboard. Ready to post!');
    }
}
