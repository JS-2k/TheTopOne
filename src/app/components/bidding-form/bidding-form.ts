import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { UiService } from '../../services/ui.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-bidding-form',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './bidding-form.html',
  standalone: true
})
export class BiddingFormComponent {
  @Input() countryId?: string | null;
  @Output() close = new EventEmitter<void>();

  private bidService = inject(BidService);
  private mapService = inject(MapService);
  uiService = inject(UiService);

  name = signal('');
  message = signal('');
  avatarUrl = signal('');
  promoteText = signal('');
  promoteUrl = signal('');
  productLinkText = signal('');
  productLinkUrl = signal('');
  currentStep = signal(1);
  instagram = signal('');
  x = signal('');
  linkedin = signal('');
  youtube = signal('');
  tiktok = signal('');
  color = signal('#1effc8');

  availableColors = [
    '#1effc8', // Teal
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f97316', // Orange
    '#eab308', // Yellow
    '#3b82f6', // Blue
    '#3f3f46'  // Dark Gray
  ];

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  get displayAmount(): number {
    return this.countryId
      ? this.mapService.getCountryOwnership(this.countryId).currentPrice
      : this.uiService.proposedBidAmount();
  }

  get isOpen(): boolean {
    return this.uiService.isModalOpen() || !!this.countryId;
  }

  closeModal() {
    this.uiService.closeModal();
    this.close.emit();
  }

  submitBid() {
    if (!this.name().trim() || !this.promoteUrl().trim()) return;

    const bidAmount = this.countryId
      ? this.mapService.getCountryOwnership(this.countryId).currentPrice
      : this.uiService.proposedBidAmount();

    const bid = {
      id: Date.now().toString(),
      name: this.name(),
      handle: this.promoteUrl(), // Legacy fallback map
      message: this.message(),
      avatarUrl: this.avatarUrl(),
      promoteText: this.promoteText(),
      promoteUrl: this.promoteUrl(),
      productLinkText: this.productLinkText(),
      productLinkUrl: this.productLinkUrl(),
      instagram: this.instagram(),
      x: this.x(),
      linkedin: this.linkedin(),
      youtube: this.youtube(),
      tiktok: this.tiktok(),
      color: this.color(),
      amount: bidAmount,
      isUrl: true,
      rank: 0,
      clicks: 0,
      timestamp: new Date()
    };

    if (this.countryId) {
      this.mapService.placeBid(this.countryId, bid);
    } else {
      this.bidService.addBid(bid);
    }

    this.name.set('');
    this.message.set('');
    this.avatarUrl.set('');
    this.promoteText.set('');
    this.promoteUrl.set('');
    this.productLinkText.set('');
    this.productLinkUrl.set('');
    this.instagram.set('');
    this.x.set('');
    this.linkedin.set('');
    this.youtube.set('');
    this.tiktok.set('');
    this.currentStep.set(1);

    this.closeModal();
  }

  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    } else {
      this.submitBid();
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }
}
