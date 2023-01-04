import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";
import User from "./User";

interface MessageAttributes {
  id?: number,
  text?: string | null,
  hasSeen?: boolean | null,
  senderId?: string | null,
  receiverId?: string | null,


  createdAt?: Date,
  updatedAt? : Date
}

export interface MessageInput extends Optional<MessageAttributes, 'id'>{ }
export interface MessageOutput extends Required<MessageAttributes>{ }

class Message extends Model<MessageAttributes, MessageInput> implements MessageAttributes {
  public id!: number;
  public roleName!: string;
  public active!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt! : Date;
}

Message.init({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.BIGINT
  },
  text: {
    allowNull: true,
    type: DataTypes.TEXT
  },
  hasSeen: {
    allowNull: true,
    type: DataTypes.BOOLEAN
  },
  senderId: {
    allowNull: true,
    type: DataTypes.BIGINT
  },
  receiverId: {
    allowNull: true,
    type: DataTypes.BIGINT
  }
}, {
  timestamps: true,
  sequelize: connection,
  underscored: false
});

Message.belongsTo(User, { foreignKey: "senderId"})
Message.belongsTo(User, { foreignKey: "receiverId"})

export default Message;  