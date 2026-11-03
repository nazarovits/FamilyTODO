import { Router } from "express";

import { postLogin } from "../handlers/auth/auth.js";

const router = Router();

router.post("/login", postLogin);

export default router;
