import { Component, inject, effect, signal, computed, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { CountryOwnership } from '../../models/country.model';
import { Bid } from '../../models/bid.model';

export interface OverlayData {
    countryId: string;
    x: number;
    y: number;
    owner: Bid;
    price: number;
}

export interface PromotionEvent {
    countryId: string;
    countryName: string;
    x: number;
    y: number;
    bid: Bid;
    state: 'pulse' | 'card' | 'minimized';
}

@Component({
    selector: 'app-world-map',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './world-map.html',
    styleUrls: ['./world-map.css']
})
export class WorldMapComponent {
    private mapService = inject(MapService);
    ownershipInfo = this.mapService.ownershipInfo;
    selectedCountryId = this.mapService.selectedCountryId;

    // Assume an onyx theme is active
    currentOnyxTheme = true;

    hoveredCountry = signal<CountryOwnership | null>(null);
    mouseX = signal<number>(0);
    mouseY = signal<number>(0);

    // Pan and Zoom
    viewBoxX = signal(30.767);
    viewBoxY = signal(241.591);
    viewBoxW = signal(784.077);
    viewBoxH = signal(458.627);
    viewBoxStr = computed(() => `${this.viewBoxX()} ${this.viewBoxY()} ${this.viewBoxW()} ${this.viewBoxH()}`);

    isPanning = signal(false);
    lastPanX = 0;
    lastPanY = 0;
    dragDistX = 0;
    dragDistY = 0;

    overlays = signal<OverlayData[]>([]);

    // Live Promotion Event State
    activePromotion = signal<PromotionEvent | null>(null);

    constructor() {
        effect(() => {
            const ownership = this.ownershipInfo();
            this.recalculateOverlays(ownership);
        }, { allowSignalWrites: true });

        // Listen for live promotion events
        effect(() => {
            const victory = this.mapService.victorySignal();
            if (victory) {
                setTimeout(() => this.triggerPromotion(victory.countryId, victory.bid), 100);
            }
        }, { allowSignalWrites: true });
    }

    ngAfterViewInit() {
        // Make absolutely sure overlays are placed once the huge SVG enters DOM
        setTimeout(() => this.recalculateOverlays(this.ownershipInfo()), 300);

        // SHOWCASE: Automatically trigger an animation 2 seconds after map loads so user can see it natively.
        setTimeout(() => {
            const data = this.mapService.getCountryOwnership('us'); // US dummy data
            if (data && data.currentOwner) {
                // Clear victory so we can re-trigger it safely if needed, or just call triggerPromotion directly
                this.triggerPromotion('us', data.currentOwner);
            }
        }, 2000);
    }

    private smoothPanCamera(targetX: number, targetY: number) {
        const startX = this.viewBoxX();
        const startY = this.viewBoxY();
        const dist = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
        if (dist < 1) return;

        let startTime: number | null = null;
        const duration = 1200; // 1.2 seconds, perfectly aligning with the Phase 2 card emergence!

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            this.viewBoxX.set(startX + (targetX - startX) * ease);
            this.viewBoxY.set(startY + (targetY - startY) * ease);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    triggerPromotion(countryId: string, bid: Bid) {
        const svgMap = document.getElementById('world-map') as any as SVGSVGElement;
        if (!svgMap) return;
        const el = svgMap.querySelector(`#${countryId}`) as SVGGraphicsElement;
        if (!el) return;
        let bbox;
        try { bbox = el.getBBox(); } catch (e) { return; }

        if (bbox.width > 0) {
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;

            this.activePromotion.set({
                countryId,
                countryName: countryId.toUpperCase(),
                x: cx,
                y: cy,
                bid,
                state: 'pulse'
            });

            // Pan the camera seamlessly so the popup (which rises ~250px above cy) is fully visible
            const targetX = cx - this.viewBoxW() / 2;
            const targetY = cy - 250 - (this.viewBoxH() * 0.2); // Offset UP heavily so the top card area rests deep inside the window
            this.smoothPanCamera(targetX, targetY);

            // Transition to card Phase
            setTimeout(() => {
                const current = this.activePromotion();
                if (current && current.countryId === countryId) {
                    this.activePromotion.update(p => p ? { ...p, state: 'card' } : p);
                }
            }, 1200);

            // Transition to minimized Phase
            setTimeout(() => {
                const current = this.activePromotion();
                if (current && current.countryId === countryId && current.state === 'card') {
                    this.activePromotion.update(p => p ? { ...p, state: 'minimized' } : p);
                }
            }, 7200);
        }
    }

    reopenPromotion() {
        const current = this.activePromotion();
        if (current) {
            // Pan back to it!
            const targetX = current.x - this.viewBoxW() / 2;
            const targetY = current.y - 250 - (this.viewBoxH() * 0.2);
            this.smoothPanCamera(targetX, targetY);

            this.activePromotion.update(p => p ? { ...p, state: 'card' } : p);

            // Auto minimize again
            setTimeout(() => {
                const refreshed = this.activePromotion();
                if (refreshed && refreshed.state === 'card') {
                    this.activePromotion.update(p => p ? { ...p, state: 'minimized' } : p);
                }
            }, 5000);
        }
    }

    private recalculateOverlays(ownership: Map<string, CountryOwnership>) {
        // Apply owned styles to SVG mapping outside of angular context loop
        setTimeout(() => {
            const svgMap = document.getElementById('world-map') as any as SVGSVGElement;
            if (!svgMap) return;

            let topOneId: string | null = null;
            let highestAmount = -1;

            ownership.forEach((data, id) => {
                if (data.currentOwner && data.currentOwner.amount > highestAmount) {
                    highestAmount = data.currentOwner.amount;
                    topOneId = id;
                }
            });

            const newOverlays: OverlayData[] = [];

            ownership.forEach((data, id) => {
                if (data.currentOwner) {
                    const el = svgMap.querySelector(`#${id}`) as SVGGraphicsElement;
                    if (el) {
                        if (id === topOneId) {
                            el.classList.add('top-one-country');
                            el.classList.remove('owned-country');
                        } else {
                            if (!el.classList.contains('owned-country')) {
                                el.classList.add('owned-country');
                            }
                            el.classList.remove('top-one-country');
                        }

                        if (data.currentOwner.color && id !== topOneId) {
                            el.style.setProperty('--owned-color', data.currentOwner.color);
                        }

                        // Determine visual center
                        let bbox;
                        try {
                            bbox = el.getBBox();
                        } catch (e) {
                            // Fallback if not rendered
                            bbox = { x: 0, y: 0, width: 0, height: 0 };
                        }

                        if (bbox.width > 0) {
                            newOverlays.push({
                                countryId: id,
                                x: bbox.x + bbox.width / 2,
                                y: bbox.y + bbox.height / 2,
                                owner: data.currentOwner,
                                price: data.currentPrice
                            });
                        }
                    }
                }
            });

            this.overlays.set(newOverlays);
        }, 50);
    }

    onWheel(event: WheelEvent) {
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;

        const newW = this.viewBoxW() * zoomFactor;
        const newH = this.viewBoxH() * zoomFactor;

        const dw = this.viewBoxW() - newW;
        const dh = this.viewBoxH() - newH;

        this.viewBoxX.update(x => x + dw / 2);
        this.viewBoxY.update(y => y + dh / 2);
        this.viewBoxW.set(newW);
        this.viewBoxH.set(newH);
    }

    onMouseDown(event: MouseEvent) {
        if (event.button === 0) { // left click
            this.isPanning.set(true);
            this.lastPanX = event.clientX;
            this.lastPanY = event.clientY;
            this.dragDistX = 0;
            this.dragDistY = 0;
        }
    }

    onMouseUp() {
        this.isPanning.set(false);
    }

    onMouseMove(event: MouseEvent) {
        if (this.isPanning()) {
            const dx = event.clientX - this.lastPanX;
            const dy = event.clientY - this.lastPanY;
            this.lastPanX = event.clientX;
            this.lastPanY = event.clientY;
            this.dragDistX += Math.abs(dx);
            this.dragDistY += Math.abs(dy);

            const svgMap = document.getElementById('world-map');
            if (svgMap) {
                const scaleX = this.viewBoxW() / svgMap.clientWidth;
                const scaleY = this.viewBoxH() / svgMap.clientHeight;
                this.viewBoxX.update(x => x - dx * scaleX);
                this.viewBoxY.update(y => y - dy * scaleY);
            }
        }

        const target = event.target as SVGElement;
        let countryId: string | null = null;

        if (target.id && target.id !== 'world-map') {
            countryId = target.id;
        } else if (target.parentElement && target.parentElement.id && target.parentElement.id !== 'world-map') {
            countryId = target.parentElement.id;
        }

        if (countryId) {
            if (countryId.startsWith('_')) {
                // Handle variations
            }
            this.hoveredCountry.set(this.mapService.getCountryOwnership(countryId));
        } else {
            this.hoveredCountry.set(null);
        }

        this.mouseX.set(event.clientX);
        this.mouseY.set(event.clientY);
    }

    onMouseOut() {
        this.hoveredCountry.set(null);
    }

    onMapClick(event: MouseEvent) {
        // Prevent click if we dragged 
        if (this.dragDistX > 5 || this.dragDistY > 5) {
            return;
        }

        const target = event.target as SVGElement;

        let countryId: string | null = null;

        if (target.id && target.id !== 'world-map') {
            countryId = target.id;
        } else if (target.parentElement?.id && target.parentElement.id !== 'world-map') {
            countryId = target.parentElement.id;
        }

        if (countryId) {
            if (countryId.startsWith('_')) {
                // handle special cases or unknown iso
                // e.g., "_somaliland"
            }
            this.mapService.selectCountry(countryId);
            this.updateHighlight(countryId);
        }
    }

    clickOverlay(overlay: OverlayData, event: MouseEvent) {
        // Prevent click if we dragged 
        if (this.dragDistX > 5 || this.dragDistY > 5) {
            return;
        }
        event.stopPropagation();
        this.mapService.selectCountry(overlay.countryId);
        this.updateHighlight(overlay.countryId);
    }

    // Update map highlighting (the view) based on state
    private updateHighlight(countryId: string) {
        // We update all paths to active/inactive.
        // Given we're dealing with raw DOM SVG here for performance:
        const svgMap = document.getElementById('world-map');
        if (!svgMap) return;

        // Reset all previously selected
        svgMap.querySelectorAll('.selected-country').forEach(el => {
            el.classList.remove('selected-country');
        });

        const targetEl = svgMap.querySelector(`#${countryId}`);
        if (targetEl) {
            targetEl.classList.add('selected-country');
        }
    }
}
