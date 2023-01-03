import express from "express";

import RoleController from "../controllers/RoleController";
import UserController from "../controllers/UserController";
import MasterMenuController from "../controllers/MasterMenuController";
import SubmenuController from "../controllers/SubmenuController";
import RoleMenuAccessController from "../controllers/RoleMenuAccessController";

import UserValidation from "../middleware/validation/UserValidation";
import Authorization from "../middleware/Authorization";
import MenuValidation from "../middleware/validation/MenuValidation";
import MessageController from "../controllers/MessageController";

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
router.post("/user/signup-google",UserController.RegisterGoogle);
router.post("/user/login-google", UserController.UserLoginGoogle);


// Master Menu Router
router.post("/menu", MenuValidation.CreateMenuValidation, Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.CreateMenu);
router.get("/menu", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.GetListMenu);
router.get("/menu/get/all", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.GetAllMenu);
router.get("/menu/:id", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.GetDetailMenu);
router.patch("/menu/:id", MenuValidation.CreateMenuValidation, Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.UpdateMenu);
router.delete("/menu/:id", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.SoftDeleteMenu);
router.delete("/menu/permanent/:id", Authorization.Authenticated, Authorization.AdminRole, MasterMenuController.DeletePermanent);

// Submenu router
router.post("/sub-menu", MenuValidation.CreateSubmenuValidation, Authorization.Authenticated, Authorization.AdminRole, SubmenuController.CreateSubmenu);
router.get("/sub-menu", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.GetListSubmenu);
router.get("/sub-menu/get/all", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.GetAllSubmenu);
router.get("/sub-menu/:id", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.GetDetailSubmenu);
router.patch("/sub-menu/:id", MenuValidation.CreateSubmenuValidation, Authorization.Authenticated, Authorization.AdminRole, SubmenuController.UpdateSubmenu);
router.delete("/sub-menu/:id", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.SoftDelete);
router.delete("/sub-menu/permanent/:id", Authorization.Authenticated, Authorization.AdminRole, SubmenuController.DeletePermanent);

// Role Menu Access router
router.post("/role-menu-access", MenuValidation.CreateRoleMenuAccess , Authorization.Authenticated, Authorization.AdminRole, RoleMenuAccessController.CreateAccess);
router.get("/role-menu-access", Authorization.Authenticated, Authorization.AdminRole, RoleMenuAccessController.GetList);
router.get("/role-menu-access/get/all", Authorization.Authenticated, Authorization.AdminRole, RoleMenuAccessController.GetAll);
router.get("/role-menu-access/:id", Authorization.Authenticated, Authorization.AdminRole, RoleMenuAccessController.GetDetail);
router.patch("/role-menu-access/:id", MenuValidation.CreateRoleMenuAccess, Authorization.Authenticated, Authorization.AdminRole, RoleMenuAccessController.UpdateAccess);
router.delete("/role-menu-access/:id", Authorization.Authenticated, Authorization.AdminRole, RoleMenuAccessController.SoftDelete);

// Message router
router.post("/message/:receiverId", Authorization.Authenticated, MessageController.CreateMessage);
router.post("/message/get/:receiverId", Authorization.Authenticated, MessageController.GetDetailMessage);
router.get("/message/:senderId", Authorization.Authenticated, MessageController.GetListMessage);



export default router;