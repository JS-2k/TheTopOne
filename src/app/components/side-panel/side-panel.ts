import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { UiService } from '../../services/ui.service';
import { BiddingFormComponent } from '../bidding-form/bidding-form';
import { Bid } from '../../models/bid.model';

@Component({
    selector: 'app-side-panel',
    standalone: true,
    imports: [CommonModule, BiddingFormComponent],
    templateUrl: './side-panel.html',
    styleUrls: ['./side-panel.css']
})
export class SidePanelComponent {
    private mapService = inject(MapService);
    private uiService = inject(UiService);

    selectedCountryId = this.mapService.selectedCountryId;

    countryData = computed(() => {
        const id = this.selectedCountryId();
        if (!id) return null;
        return this.mapService.getCountryOwnership(id);
    });

    showBiddingForm = false;

    closePanel() {
        this.mapService.selectCountry(null);
        this.showBiddingForm = false;
    }

    openBidding() {
        this.showBiddingForm = true;
    }

    closeBidding() {
        this.showBiddingForm = false;
    }

    openProfile(bid: Bid) {
        this.uiService.openProfile(bid);
    }
}
