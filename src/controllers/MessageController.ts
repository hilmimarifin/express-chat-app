import { Request, Response, raw } from "express";
import Message from "../db/models/Message";
import Helper from "../helpers/Helper";
import { Op, Sequelize } from "sequelize"

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

        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ receiverId, senderId }, { receiverId: senderId, senderId: receiverId }],
            }
        })
        const ids = messages.map(message => message.id)

        await Message.update({ hasSeen: true }, { where: { id: ids } })

        const updatedMessages = await Message.findAll({
            where: {
                [Op.or]: [{ receiverId, senderId }, { receiverId: senderId, senderId: receiverId }],
            }
        })


        return res.status(201).send(Helper.ResponseData(201, "Success", null, updatedMessages));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const GetListMessage = async (req: Request, res: Response): Promise<Response> => {
    try {
        //todos
        //2. unread count
        const refreshToken = req.cookies?.refreshToken

        if (!refreshToken) {
            return res.status(401).send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);
        const senderId = decodedUser?.id
        const messages = await Message.findAll({
            attributes: ["id", [Sequelize.fn('MAX', Sequelize.col('text')), 'text'], "senderId", "receiverId", "createdAt"],
            where: {
                [Op.or]: [{ receiverId: senderId }, { senderId }]
            },
            group: ["receiverId", "senderId"],
            raw: true
        })
        const combineMessage = (messagesParams: any) => {
            const combined: any = []
            messagesParams.forEach((message: any) => {
                messagesParams.forEach((matcher: any) => {
                    if (message.senderId === matcher.receiverId && message.receiverId === matcher.senderId) {
                        combined.push([message, matcher])
                    }
                })
            })
            return combined
        }
        const getLatestMessage = (messageParams: any[]) => {
            return messageParams.map((message: any[]) => {
                return message.reduce((result: any, current: any) => {
                    const da = new Date(result?.createdAt)
                    const db = new Date(current?.createdAt)
                    return (da > db ? result : current)
                })
            })
        }
        const removeDuplicateMessage = (messageParams: any[]) => {
            return messageParams.reduce((result: any[], current) => {
                let found = false;
                for (let i = 0; i < result.length; i++) {
                   if (result[i].id === current.id) {
                      found = true;
                   };
                }
                if (!found) {
                   result.push(current);
                }
                return result;
            }, [])
        }

        const combinedMessage = combineMessage(messages)
        const latestMessage = getLatestMessage(combinedMessage)
        const finalMessage = removeDuplicateMessage(latestMessage)
        return res.status(201).send(Helper.ResponseData(201, "Success", null, finalMessage));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};


export default { CreateMessage, GetDetailMessage, GetListMessage }