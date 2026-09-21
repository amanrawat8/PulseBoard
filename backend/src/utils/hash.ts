import bcrypt from "bcryptjs"
import { createHash } from "node:crypto";

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
} 

export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}



