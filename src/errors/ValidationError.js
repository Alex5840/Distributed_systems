import AppError from "./AppError.js";

class ValidationError extends AppError {

    constructor(message) {

        super(message, 404);

    }

}

export default NotFoundError;