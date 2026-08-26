import { Component, inject } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.html',
  standalone: true
})
export class ProfileModalComponent {
  uiService = inject(UiService);
  bidService = inject(BidService);

  getInitials(name: string): string {
    const cleanName = name.replace('@', '').replace('https://', '').replace('http://', '').replace('www.', '');
    return cleanName.charAt(0) || '?';
  }

  visitProfile() {
    this.openExternalLink(this.uiService.selectedBid()?.handle);
  }

  visitPromotion() {
    this.openExternalLink(this.uiService.selectedBid()?.promoteUrl);
  }

  private openExternalLink(rawUrl: string | undefined) {
    if (!rawUrl) return;
    const bid = this.uiService.selectedBid();
    if (bid) {
      this.bidService.incrementClicks(bid.id);
    }

    let url = rawUrl;
    if (!url.startsWith('http')) {
      if (url.includes('.')) {
        url = 'https://' + url;
      } else {
        url = 'https://twitter.com/' + url.replace('@', '');
      }
    }
    window.open(url, '_blank');
    this.uiService.closeProfile();
  }
}
