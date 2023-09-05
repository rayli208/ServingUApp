export interface Employee {
    id: string;
    uid: string;
    name: string;
    position: string;
    imgUrl: string | null;
    employmentType: string;
    phone: string;
    email: string;
    clockedIn: boolean;
    clockedInTime: Date | null;
    employeed: boolean;
    floorEmployee: boolean;
  }
  