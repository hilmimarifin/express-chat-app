import express from "express";

import RoleController from "../controllers/RoleController";
import UserController from "../controllers/UserController";
import MasterMenuController from "../controllers/MasterMenuController";

import UserValidation from "../middleware/validation/UserValidation";
import Authorization from "../middleware/Authorization";
import MenuValidation from "../middleware/validation/MenuValidation";

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
router.get("/user/logout", Authorization.Authenticated, UserController.UserLogout);

// Master Menu Router
router.post("/menu", MenuValidation.CreateMenuValidation, Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.CreateMenu);
router.get("/menu", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.GetDetailMenu);
router.get("/menu/get/all", Authorization.Authenticated, Authorization.SuperUser, MasterMenuController.GetAllMenu);
router.get("/menu/:id", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.GetDetailMenu);
router.patch("/menu/:id", MenuValidation.CreateMenuValidation, Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.UpdateMenu);
router.delete("/menu/:id", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.SoftDeleteMenu);
router.delete("/menu/permanent/:id", Authorization.Authenticated, Authorization.SuperUser, MasterMenuController.DeletePermanent);


export default router;