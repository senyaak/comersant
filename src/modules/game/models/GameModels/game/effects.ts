import { AuctionEffect } from './domains/auction';
import { CardEffect } from './domains/cards';
import { MovementEffect } from './domains/movement';
import { PropertyEffect } from './domains/properties';

export type { AuctionEffect, CardEffect, MovementEffect, PropertyEffect };

export type GameEffect = AuctionEffect | MovementEffect | PropertyEffect | CardEffect;
