// import { Player } from './player';

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
export class AreaSite extends Property {
  constructor(private price: number) {
    super();
  }
}

export class Business extends Property {
  grade: BussinessGrade = BussinessGrade.Zone;
}

export class GovBusiness extends Business {}
export class PrivateBusiness extends Business {
  constructor(private group: number) {
    super();
  }
}
