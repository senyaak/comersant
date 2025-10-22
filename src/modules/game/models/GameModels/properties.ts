// import { Player } from './player';

import { Player } from './player';

enum BussinessGrade {
  Area = 1,
  Office = 2,
  Department = 3,
  Enterprise = 4,
}

type Grades = [
  [areaBuy: number, areaPayout: number],
  [officeBuy: number, officePayout: number],
  [departmentBuy: number, departmentPayout: number],
  [enterpriseBuy: number, enterprisePayout: number],
];

export abstract class Property {
  static isProperty(obj: object): obj is Property {
    return 'price' in obj && 'owner' in obj;
  }

  constructor(
    public readonly price: number,
    public owner: Player['id'] | null = null,
  ) {}
}

export class AreaSite extends Property {
  static isAreaSite(obj: object): obj is AreaSite {
    return Property.isProperty(obj);
  }
}

export abstract class Business extends Property {
  static isBusiness(obj: object): obj is Business {
    return Property.isProperty(obj) && 'group' in obj && 'upgradePrice' in obj && 'grades' in obj && 'grade' in obj;
  }

  constructor(
    price: number,
    public readonly upgradePrice: number,
    public readonly grades: Grades,
    owner: Player['id'] | null = null,
    public grade: BussinessGrade = 1,
  ) {
    super(price, owner);
  }

  get areaBuy(): number {
    return this.grades[0][0];
  }

  get areaPayout(): number {
    return this.grades[0][1];
  }

  get buys(): number[] {
    return [
      this.areaBuy,
      this.officeBuy,
      this.departmentBuy,
      this.enterpriseBuy,
    ];
  }

  get departmentBuy(): number {
    return this.grades[2][0];
  }

  get departmentPayout(): number {
    return this.grades[2][1];
  }

  get enterpriseBuy(): number {
    return this.grades[3][0];
  }

  get enterprisePayout(): number {
    return this.grades[3][1];
  }

  get officeBuy(): number {
    return this.grades[1][0];
  }

  get officePayout(): number {
    return this.grades[1][1];
  }

  get payouts(): number[] {
    return [
      this.areaPayout,
      this.officePayout,
      this.departmentPayout,
      this.enterprisePayout,
    ];
  }
}

export class GovBusiness extends Business {
  static isGovBusiness(obj: object): obj is GovBusiness {
    return Business.isBusiness(obj);
  }
}

export class PrivateBusiness extends Business {
  static isPrivateBusiness(obj: object): obj is PrivateBusiness {
    return Business.isBusiness(obj) && 'group' in obj;
  }

  constructor(
    public readonly group: number,
    price: number,
    upgradePrice: number,
    grades: Grades,
    owner: Player['id'] | null = null,
    grade: BussinessGrade = 1,
  ) {
    super(price, upgradePrice, grades, owner, grade);
  }
}
