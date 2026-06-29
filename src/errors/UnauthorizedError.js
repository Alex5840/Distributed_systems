import AppError from "./AppError.js";

class UnauthorizedError extends AppError {

    constructor(message) {

        super(message, 404);

    }

}

export default NotFoundError;