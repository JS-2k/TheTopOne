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

    constructor() { }

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
