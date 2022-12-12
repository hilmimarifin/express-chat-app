import express from "express";

import RoleController from "../controllers/RoleController";
import UserController from "../controllers/UserController";
import UserValidation from "../middleware/validation/UserValidation";
import Authorization from "../middleware/Authorization";

const router = express.Router();

//role router
router.get("/role", Authorization.Authenticated,  RoleController.GetRole);
router.post("/role", Authorization.Authenticated, RoleController.CreateRole);
router.post("/role/:id", Authorization.Authenticated, RoleController.UpdateRole);
router.delete("/role/:id", Authorization.Authenticated, RoleController.DeleteRole);
router.get("/role/:id", Authorization.Authenticated, RoleController.GetRoleById);

//user router
router.post("/user/signup",UserValidation.RegisterValidation, UserController.Register);
router.post("/user/login", UserController.UserLogin);
router.get("/user/refresh-token", UserController.RefreshToken);
router.get("/user/current-user", Authorization.Authenticated, UserController.UserDetail);

export default router;