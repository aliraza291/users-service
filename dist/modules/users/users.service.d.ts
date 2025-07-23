export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UsersService {
    private users;
    createUser(data: any): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    updateUser(id: string, data: any): Promise<User | null>;
    deleteUser(id: string): Promise<boolean>;
    getAllUsers(): Promise<User[]>;
}
