// import { Player } from './player';

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
  constructor(public readonly price: number) {}
  // owner: Player | null = null;
}

export class AreaSite extends Property {}

export class Business extends Property {
  grade: BussinessGrade = 1;

  constructor(
    price: number,
    public readonly upgradePrice: number,
    public readonly grades: Grades,
  ) {
    super(price);
  }

  get areaBuy(): number {
    return this.grades[0][0];
  }
  get areaPayout(): number {
    return this.grades[0][1];
  }
  get officeBuy(): number {
    return this.grades[1][0];
  }
  get officePayout(): number {
    return this.grades[1][1];
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
  get buys(): number[] {
    return [
      this.areaBuy,
      this.officeBuy,
      this.departmentBuy,
      this.enterpriseBuy,
    ];
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

export class GovBusiness extends Business {}
export class PrivateBusiness extends Business {
  constructor(
    public readonly group: number,
    price: number,
    upgradePrice: number,
    grades: Grades,
  ) {
    super(price, upgradePrice, grades);
  }
}
