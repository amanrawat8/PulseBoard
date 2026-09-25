import { hash } from "node:crypto";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { comparePassword, hashToken } from "../../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";




const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;


export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {email}
    });
    
    if(!user) {
        throw new AppError(401, "Invalid Email or Password");
    }


    const isValid = await comparePassword(password, user.passwordHash);
    if(!isValid) {
        throw new AppError(401, "Invalid email or password");
    }


    const accessToken = signAccessToken({
        sub: user.id,
        role: user.role
    });

    const refreshToken = signRefreshToken({
        sub: user.id,
        role: user.role
    });


    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
    });


    return {
        accessToken,
        refreshToken,
        user: {id: user.id, name: user.name, email: user.email, role: user.role },
    };
}


export async function refresh(oldRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const tokenHash = hashToken(oldRefreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token is no longer valid");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
  const newRefreshToken = signRefreshToken({ sub: payload.sub, role: payload.role });

  await prisma.refreshToken.create({
    data: {
      userId: payload.sub,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}



export async function getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError(404, "User not found");
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role };
}


export async function logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null},
        data: {revokedAt: new Date() },
    });
}
