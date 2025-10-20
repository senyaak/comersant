import { Board } from '../FieldModels/board';
import { IRawPlayer } from './player';
import { Turn } from './turn';

export interface IRawGame {
  id: string;
  players: IRawPlayer[];

  currentPlayer: number;
  currentTurnState: Turn;
  currentTurnIterator: Generator<Turn>;

  board: Board;
}

/** nice hack to strip methods and assertions from class type :) */
// type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// type DataFieldKeys<T> = {
//   [K in keyof T]: IsFunction<T[K]> extends true ? never : K
// }[keyof T];

// type DataOnly<T> = {
//   [K in DataFieldKeys<T>]:
//     T[K] extends Array<infer U>
//       ? DataOnly<U>[]
//       : T[K] extends object
//         ? DataOnly<T[K]>
//         : T[K]
// };
