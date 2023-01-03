import { Request, Response } from "express";
import Message from "../db/models/Message";
import Helper from "../helpers/Helper";
import { Op } from "sequelize"

const CreateMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { receiverId } = req.params
        const { text } = req.body;
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) {
            return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);

        const message = await Message.create({ text, receiverId, senderId: decodedUser?.id, hasSeen: false })

        return res.status(201).send(Helper.ResponseData(201, "Created", null, message));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const GetDetailMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { receiverId } = req.params
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) {
            return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);
        const senderId = decodedUser?.id

        const message = await Message.findAll({
            where: {
                [Op.or]: [{ receiverId, senderId }, { receiverId: senderId, senderId: receiverId }],
            }
        })

        return res.status(201).send(Helper.ResponseData(201, "Success", null, message));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const GetListMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        //todos
        //1. Order for last message to show in the list
        //2. unread count
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) {
            return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);
        const senderId = decodedUser?.id

        const message = await Message.findAll({
            where: {
                [Op.or]: [{ receiverId: senderId }, { senderId }]
            },
            order: [['createdAt', 'ASC']],
            group: 'receiverId'
        })

        return res.status(201).send(Helper.ResponseData(201, "Success", null, message));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};


export default { CreateMessage, GetDetailMessage, GetListMessage }