import { Injectable, signal } from '@angular/core';
import { Bid } from '../models/bid.model';

@Injectable({ providedIn: 'root' })
export class UiService {
    isModalOpen = signal(false);
    proposedBidAmount = signal<number>(0);

    isProfileModalOpen = signal(false);
    selectedBid = signal<Bid | null>(null);

    openModal() {
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
    }

    openProfile(bid: Bid) {
        this.selectedBid.set(bid);
        this.isProfileModalOpen.set(true);
    }

    closeProfile() {
        this.isProfileModalOpen.set(false);
        this.selectedBid.set(null);
    }
}
