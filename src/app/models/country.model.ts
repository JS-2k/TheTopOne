import { Bid } from './bid.model';

export interface Country {
    id: string; // ISO 2-letter or 3-letter code, e.g. "US", "IN"
    name: string;
}

export interface CountryOwnership {
    countryId: string;
    currentOwner: Bid | null;
    history: Bid[]; // Previous owners
    currentPrice: number; // Defaults to 1
}
