import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { UiService } from '../../services/ui.service';
import { Bid } from '../../models/bid.model';
import { ProfileModalComponent } from '../profile-modal/profile-modal';

@Component({
    selector: 'app-leaderboard-page',
    standalone: true,
    imports: [CommonModule, ProfileModalComponent],
    templateUrl: './leaderboard-page.html',
})
export class LeaderboardPageComponent {
    private mapService = inject(MapService);
    private uiService = inject(UiService);

    allBids = computed(() => {
        const ownership = this.mapService.ownershipInfo();
        const allBidsArray: { countryId: string, owner: Bid }[] = [];

        ownership.forEach((data, id) => {
            if (data.currentOwner) {
                allBidsArray.push({ countryId: id, owner: data.currentOwner });
            }

            // Also potentially include history? The user said "show it separate screen based on amount that bid".
            // They also said "add Leaderboard in navbar show it separate screen based on amount that bid"
            // Let's just list the current owners, sorted by amount. Or include everyone?
            // Usually leaderboards list the top owners (1 per country). Let's do that for now.
        });

        return allBidsArray.sort((a, b) => b.owner.amount - a.owner.amount);
    });

    openProfile(bid: Bid) {
        this.uiService.openProfile(bid);
    }
}
