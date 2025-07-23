"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
let UsersService = class UsersService {
    constructor() {
        this.users = new Map();
    }
    async createUser(data) {
        const id = `user_${Date.now()}`;
        const user = {
            id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.set(id, user);
        return user;
    }
    async getUserById(id) {
        return this.users.get(id) || null;
    }
    async updateUser(id, data) {
        const user = this.users.get(id);
        if (!user)
            return null;
        const updatedUser = {
            ...user,
            ...data,
            updatedAt: new Date()
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    async deleteUser(id) {
        return this.users.delete(id);
    }
    async getAllUsers() {
        return Array.from(this.users.values());
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map