import { Injectable, signal, computed } from '@angular/core';
import { Bid } from '../models/bid.model';

@Injectable({ providedIn: 'root' })
export class BidService {
    private _bids = signal<Bid[]>([
        {
            id: '1', rank: 1, name: 'Satoshi Nakamoto', handle: 'twitter.com/satoshi', message: 'Genesis block architect.', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SN&backgroundColor=111111&textColor=ffffff', amount: 5000, isUrl: true, clicks: 12050, promoteText: 'Read the original Bitcoin Whitepaper', promoteUrl: 'https://bitcoin.org/bitcoin.pdf', timestamp: new Date()
        },
        {
            id: '2', rank: 2, name: 'Untitled Foundation', handle: 'untitled.com', message: 'Silent ambition.', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=UF&backgroundColor=111111&textColor=ffffff', amount: 4500, isUrl: true, clicks: 8092, promoteText: 'Join our exclusive newsletter', promoteUrl: 'https://untitled.com/join', timestamp: new Date()
        },
        {
            id: '3', rank: 3, name: 'The Void', handle: '@void', message: 'Embrace the empty space.', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=V&backgroundColor=111111&textColor=ffffff', amount: 3000, isUrl: false, clicks: 432, timestamp: new Date()
        }
    ]);

    readonly bids = computed(() => {
        const sortedList = [...this._bids()].sort((a, b) => b.amount - a.amount);
        return sortedList.map((bid, index) => ({ ...bid, rank: index + 1 }));
    });

    addBid(bidPatch: Omit<Bid, 'id' | 'rank' | 'clicks' | 'timestamp'>) {
        const newBid: Bid = {
            ...bidPatch,
            id: Math.random().toString(36).substring(2, 9),
            rank: 0,
            clicks: 0,
            timestamp: new Date()
        };
        this._bids.update(bids => [...bids, newBid]);
    }

    incrementClicks(id: string) {
        this._bids.update(bids => bids.map(b => b.id === id ? { ...b, clicks: (b.clicks || 0) + 1 } : b));
    }
}
