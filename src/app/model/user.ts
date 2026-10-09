import { module } from "./module";
import { Rol } from "./rol";

export interface user {
    email: string;
    personId: number;
    names: string;
    rol: Rol;
    modules: module[];
}