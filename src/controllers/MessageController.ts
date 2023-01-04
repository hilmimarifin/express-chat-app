import { Request, Response, raw } from "express";
import Message from "../db/models/Message";
import Helper from "../helpers/Helper";
import { Op, Sequelize } from "sequelize"
import User from "../db/models/User";

const CreateMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { receiverId } = req.params
        const { text } = req.body;

        const refreshToken = req.cookies?.refreshToken
        if (!refreshToken) {
            return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const user = await User.findByPk(receiverId)        
        if (!user) {
            return res.status(401).send(Helper.ResponseData(401, "User doesnt exist", null, null));
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

        const user = await User.findByPk(receiverId)        
        if (!user) {
            return res.status(401).send(Helper.ResponseData(401, "User doesnt exist", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);
        const senderId = decodedUser?.id

        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ receiverId, senderId }, { receiverId: senderId, senderId: receiverId }],
            },
        })
        const ids = messages.map(message => message.id)

        await Message.update({ hasSeen: true }, { where: { id: ids } })

        const updatedMessages = await Message.findAll({
            attributes:["text", "createdAt"],
            where: {
                [Op.or]: [{ receiverId, senderId }, { receiverId: senderId, senderId: receiverId }],
            },
            include:{
                model: User,
                attributes: ["name"]
            },
            raw:true
        })


        return res.status(201).send(Helper.ResponseData(201, "Success", null, updatedMessages));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const GetListMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) {
            return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);
        const senderId = decodedUser?.id
       
        const listReceiver = await Message.findAll({
            attributes: ["id", "senderId"],
            where: { receiverId: senderId },
        })

        const listReceiverId = listReceiver.filter((value: any, index, arr: any) => arr.findIndex((v: any) => v.senderId === value.senderId) === index).map((id: any) => id.senderId)
        const listMessage = await Promise.all(listReceiverId.map((value: any) => Message.findAll({
            attributes: ["text", "createdAt"],
            limit: 1,
            where: {
                [Op.or]: [{ receiverId: value, senderId }, { receiverId: senderId, senderId: value }],
            },
            order: [["createdAt", "DESC"]],
            include: {
                model: User,
                attributes: ["name"]
            },
            raw: true
        })))
        const listMessages = listMessage.flat(1)

        const listUnread = await Promise.all(listReceiverId.map((receiverId: any) => Message.count({
            where: {
                [Op.and]: [{ hasSeen: false }, { receiverId: senderId, senderId: receiverId }]
            },
        })))

        const messagesWithUnread = listMessages.map((message: any, index) => ({ ...message, unread: listUnread[index] }))

        return res.status(201).send(Helper.ResponseData(201, "Success", null, messagesWithUnread));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};


export default { CreateMessage, GetDetailMessage, GetListMessage }