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

        return res.status(201).send(Helper.ResponseData(201, "Sent", null, message));
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

        const updatedMessages : any = await Message.findAll({
            attributes: ["text", "createdAt"],
            where: {
                [Op.or]: [{ receiverId, senderId }, { receiverId: senderId, senderId: receiverId }],
            },
            include: {
                model: User,
                as: "senderUser",
                attributes: ["name", "id"],
                foreignKey: "senderId"
            },
            raw: true
        })

        const response = updatedMessages.map((message: any) => ({
            senderName: message["senderUser.name"],
            senderId: message["senderUser.id"],
            text: message.text,
            createdAt: message.createdAt,
        }))


        return res.status(201).send(Helper.ResponseData(201, "Success", null, response));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const GetListMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) {
            return res.status(401).send(Helper.ResponseData(401, "token not found", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);
        const senderId = decodedUser?.id

        const listReceiver = await Message.findAll({
            attributes: ["id", "senderId"],
            where: { receiverId: senderId },
        })

        const listReceiverId = listReceiver.filter((value: any, index, arr: any) => arr.findIndex((v: any) => v.senderId === value.senderId) === index).map((id: any) => id.senderId)
        const listMessage = await Promise.all(listReceiverId.map((value: any) => Message.findAll({
            attributes: ["text", "createdAt", "receiverId", "senderId"],
            limit: 1,
            where: {
                [Op.or]: [{ receiverId: value, senderId }, { receiverId: senderId, senderId: value }],
            },
            order: [["createdAt", "DESC"]],
            raw: true
        })))
        const listMessages: any = listMessage.flat(1)
        
        const listReceiverName: any = await Promise.all(listReceiverId.map((value: any, index) => Message.findAll({
            attributes: ["id"],
            limit: 1,
            where: {
                [Op.or]: [{ receiverId: value, senderId }, { receiverId: senderId, senderId: value }],
            },
            order: [["createdAt", "DESC"]],
            include: {
                model: User,
                as: `${listMessages[index].senderId === senderId ? "receiverUser" : "senderUser"}`,
                foreignKey: `${listMessages[index].senderId === senderId ? "receiverId" : "sernderId"}`,
                attributes: ["id", "name"],
            },
        })))
        const listUnread = await Promise.all(listReceiverId.map((receiverId: any) => Message.count({
            where: {
                [Op.and]: [{ hasSeen: false }, { receiverId: senderId, senderId: receiverId }]
            },
        })))

        const messagesWithUnread = listMessages.map((message: any, index: any) => {
            const receiver = listReceiverName[index][0][message.senderId === senderId ? "receiverUser" : "senderUser"]
            return {receiverName: receiver.name, receiverId: receiver.id, text: message.text, createdAt: message.createdAt, unread: listUnread[index] }
        })
        
        return res.status(201).send(Helper.ResponseData(201, "Success", null, messagesWithUnread));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};


export default { CreateMessage, GetDetailMessage, GetListMessage }