/**
 * Player Property Deck Component
 *
 * This component displays the player's owned properties as cards in a hand-like arrangement
 * at the bottom of the game screen, similar to cards in a card game.
 *
 * @generated This file was generated/enhanced by AI (GitHub Copilot)
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { GovPropertyColor, PropertyGroupsColors } from '$server/modules/game/models/FieldModels/board';
import { PropertyCell } from '$server/modules/game/models/FieldModels/cells';
import { AreaSite, Business, PrivateBusiness, Property } from '$server/modules/game/models/GameModels/properties';
import { Subscription } from 'rxjs';
import { LocalizationService } from 'src/app/i18n/localization.service';

import { GameService } from '../../../../services/game.service';

interface PropertyCardData {
  cell: PropertyCell<Property>;
  label: string;
  cellColor: string;
  buys?: number[];
  payouts?: number[];
  prefixes?: string[];
}

@Component({
  selector: 'app-player-property',
  standalone: false,
  templateUrl: './player-property.component.html',
  styleUrl: './player-property.component.scss',
})
export class PlayerPropertyComponent implements OnInit, OnDestroy {
  private propertyBoughtSubscription?: Subscription;

  hoveredProperty: PropertyCardData | null = null;
  isMinimized: boolean = false;
  playerProperties: PropertyCardData[] = [];

  constructor(
    private gameService: GameService,
    private localization: LocalizationService,
  ) {}

  ngOnDestroy() {
    this.propertyBoughtSubscription?.unsubscribe();
  }

  ngOnInit() {
    this.loadPlayerProperties();

    // Subscribe to property purchases to update the deck
    this.propertyBoughtSubscription = this.gameService.propertyBought$.subscribe((result) => {
      if (result.success) {
        this.loadPlayerProperties();
      }
    });
  }

  private createDemoProperties(): PropertyCardData[] {
    const demoData = [
      { name: 'gastronomie', color: PropertyGroupsColors[0] },
      { name: 'mercery', color: PropertyGroupsColors[1] },
      { name: 'diner', color: PropertyGroupsColors[2] },
    ];

    return demoData.map((demo) => ({
      cell: {} as PropertyCell<Business>, // Demo placeholder
      label: this.localization.translate(demo.name),
      cellColor: demo.color,
      buys: [900, 15000, 54000, 120000],
      payouts: [400, 1500, 5200, 11000],
      prefixes: this.getPrefixes(),
    }));
  }

  private getCellColor(cell: PropertyCell<Property>): string {
    if (cell.object instanceof AreaSite) {
      return '#808080ff'; // Gray color for area sites
    } else if (PrivateBusiness.isPrivateBusiness(cell.object)) {
      return PropertyGroupsColors[cell.object.group];
    } else {
      return GovPropertyColor;
    }
  }

  private getPrefixes(): string[] {
    return this.localization.propertyMods.map(mod =>
      this.localization.getPropertyModPrefix(mod),
    );
  }

  private isDemoMode(): boolean {
    // Check if we're in development and no real game data
    return !this.gameService.Player || !this.gameService.Game.id;
  }

  private loadPlayerProperties() {
    const ownedProperties = this.gameService.ownedProperties;
    const playerProperties = ownedProperties[this.gameService.Player.Id] || [];

    // For demo purposes, add some example properties if none exist
    if (playerProperties.length === 0 && this.isDemoMode()) {
      this.playerProperties = this.createDemoProperties();
      return;
    }

    // Include all properties (Business and AreaSite)
    this.playerProperties = playerProperties.map((cell) => {
      const baseData = {
        cell,
        label: this.localization.translate(cell.name),
        cellColor: this.getCellColor(cell),
      };

      // Add business-specific data if it's a business property
      if (cell.object instanceof Business) {
        return {
          ...baseData,
          buys: cell.object.buys,
          payouts: cell.object.payouts,
          prefixes: this.getPrefixes(),
        };
      } else {
        return baseData;
      }
    });
  }

  isAreaSite(cell: PropertyCell<Property>): cell is PropertyCell<AreaSite> {
    return cell.object instanceof AreaSite;
  }

  onPropertyHover(property: PropertyCardData | null) {
    this.hoveredProperty = property;
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  trackByPropertyName(index: number, property: PropertyCardData): string {
    return property.cell.name;
  }
}
