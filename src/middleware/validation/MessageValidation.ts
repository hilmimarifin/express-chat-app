import Validator from "validatorjs";
import { Request, Response, NextFunction } from "express";
import Helpers from "../../helpers/Helper";

const CreateMessageValidation = (req: Request, res: Response, next: NextFunction) => {
	try {
		const { text } = req.body;
		const data = {
			text
		};

		const rules: Validator.Rules = {
			"text": "required|string|min:1",
		};

		const validate = new Validator(data, rules);

		if (validate.fails()) {
			return res.status(400).send(Helpers.ResponseData(400, "Bad Request", validate.errors, null));
		}

		next();
	} catch (error: any) {
		return res.status(500).send(Helpers.ResponseData(500, "", error, null));
	}
};

export default {CreateMessageValidation}