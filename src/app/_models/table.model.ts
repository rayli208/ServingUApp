import { Employee } from "./employee.model";

export class Table {
    id: string;
    uid: string;
    assignedEmployee: Employee | {};
    tableNumber: number;
    shape: number;
    seats: string;
    floorPlan: number;
    isActive: boolean;
    positionX: number;
    positionY: number;
}
