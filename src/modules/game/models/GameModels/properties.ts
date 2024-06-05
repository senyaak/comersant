import { Player } from './player';

enum BussinessGrade {
  Zone = 1,
  Branch = 2,
  Office = 3,
  Enterprise = 4,
}

export abstract class Property {
  // TODO IMPLEMENT!
  // owner: Player | null;
}
export class Site extends Property {}

class Bussiness extends Property {
  // grade: BussinessGrade;
}

export class GovBussines extends Bussiness {}
export class PrivateBussines extends Bussiness {
  // group: number;
}
