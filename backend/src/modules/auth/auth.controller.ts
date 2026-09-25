import type { Request, Response } from "express";
import type { LoginInput } from "./auth.schema.js";
import * as authService from "./auth.service.js";
import { AppError } from "../../utils/AppError.js";
import { getAuthUser } from "../../utils/getAuthUser.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;


function setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_COOKIE_MAX_AGE,
    });
}


export async function login(req: Request, res: Response): Promise<void> {
    const { email, password} = req.body as LoginInput;
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.refreshToken );

    res.json({
        accessToken: result.accessToken, user: result.user
    });
}


export async function refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

    if(!token) {
        throw new AppError(401, "No Refresh token provided");
    }

    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.json({
        accessToken: result.accessToken
    })
}


export async function me(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const fullUser = await authService.getUserById(user.id);
    res.json({ user: fullUser });
}


export async function logout(req: Request, res: Response): Promise<void> {
    const token = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
    if(token){
        await authService.logout(token);
    }

    res.clearCookie(REFRESH_COOKIE_NAME);
    res.status(204).send();
}