import { Injectable, signal } from '@angular/core';
import { CountryOwnership } from '../models/country.model';
import { Bid } from '../models/bid.model';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    // Store the ownership state for each country ID
    private ownershipSignal = signal<Map<string, CountryOwnership>>(new Map());

    // Store the currently selected country ID
    private selectedCountryIdSignal = signal<string | null>(null);

    // Track victory modal state
    victorySignal = signal<{ countryId: string, bid: Bid } | null>(null);

    constructor() {
        const dummyBids: Bid[] = [
            { id: '1', rank: 1, name: 'Alex Wong', handle: 'alex', message: 'Ruling the states!', avatarUrl: 'https://i.pravatar.cc/150?u=1', amount: 500, isUrl: false, clicks: 120, color: '#1effc8', timestamp: new Date() },
            { id: '2', rank: 2, name: 'Sarah Chen', handle: 'sarah', message: 'Toronto tech scene.', avatarUrl: 'https://i.pravatar.cc/150?u=2', amount: 350, isUrl: false, clicks: 80, color: '#ec4899', timestamp: new Date() },
            { id: '3', rank: 3, name: 'Ravi Kumar', handle: 'ravi', message: 'King of the subcontinent 🚀', avatarUrl: 'https://i.pravatar.cc/150?u=3', amount: 200, isUrl: false, clicks: 45, color: '#eab308', timestamp: new Date() },
            { id: '4', rank: 4, name: 'Elena', handle: 'elena', message: 'European dominance.', avatarUrl: 'https://i.pravatar.cc/150?u=4', amount: 150, isUrl: false, clicks: 30, color: '#3b82f6', timestamp: new Date() },
            { id: '5', rank: 5, name: 'Kenji', handle: 'kenji', message: 'Tokyo vibes only.', avatarUrl: 'https://i.pravatar.cc/150?u=5', amount: 120, isUrl: false, clicks: 15, color: '#8b5cf6', timestamp: new Date() },
            { id: '6', rank: 6, name: 'Mateo', handle: 'mateo', message: 'South America!', avatarUrl: 'https://i.pravatar.cc/150?u=6', amount: 90, isUrl: false, clicks: 10, color: '#f97316', timestamp: new Date() },
            { id: '7', rank: 7, name: 'Jack', handle: 'jack', message: 'Down under!', avatarUrl: 'https://i.pravatar.cc/150?u=7', amount: 50, isUrl: false, clicks: 5, color: '#3f3f46', timestamp: new Date() },
        ];

        const dummyData = [
            { id: 'us', bid: dummyBids[0] },
            { id: 'ca', bid: dummyBids[1] },
            { id: 'in', bid: dummyBids[2] },
            { id: 'fr', bid: dummyBids[3] },
            { id: 'jp', bid: dummyBids[4] },
            { id: 'br', bid: dummyBids[5] },
            { id: 'au', bid: dummyBids[6] },
        ];

        const initialMap = new Map<string, CountryOwnership>();
        for (const item of dummyData) {
            initialMap.set(item.id, {
                countryId: item.id,
                currentOwner: item.bid,
                history: [
                    { ...item.bid, amount: item.bid.amount - 20, name: 'Previous Bidder 1', id: 'old1' },
                    { ...item.bid, amount: item.bid.amount - 40, name: 'Previous Bidder 2', id: 'old2' }
                ],
                currentPrice: item.bid.amount + 1
            });
        }
        this.ownershipSignal.set(initialMap);
    }

    get ownershipInfo() {
        return this.ownershipSignal.asReadonly();
    }

    get selectedCountryId() {
        return this.selectedCountryIdSignal.asReadonly();
    }

    selectCountry(countryId: string | null) {
        this.selectedCountryIdSignal.set(countryId);
    }

    getCountryOwnership(countryId: string): CountryOwnership {
        const map = this.ownershipSignal();
        if (!map.has(countryId)) {
            // Default state for unowned countries
            return {
                countryId,
                currentOwner: null,
                history: [],
                currentPrice: 1
            };
        }
        return map.get(countryId)!;
    }

    placeBid(countryId: string, bid: Bid) {
        this.ownershipSignal.update(map => {
            const newMap = new Map(map);
            const currentStats = newMap.get(countryId) || {
                countryId,
                currentOwner: null,
                history: [],
                currentPrice: 1
            };

            if (bid.amount >= currentStats.currentPrice) {
                const history = [...currentStats.history];
                if (currentStats.currentOwner) {
                    history.unshift(currentStats.currentOwner);
                }

                newMap.set(countryId, {
                    ...currentStats,
                    currentOwner: bid,
                    history: history,
                    currentPrice: bid.amount + 1 // Next bid must be at least $1 higher
                });
            }
            return newMap;
        });

        // Trigger victory screen
        this.victorySignal.set({ countryId, bid });
    }

    clearVictory() {
        this.victorySignal.set(null);
    }
}
