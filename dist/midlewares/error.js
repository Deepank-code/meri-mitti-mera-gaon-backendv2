export const errorMiddleware = (error, req, res, next) => {
    error.message ||= "internal server error";
    error.statusCode ||= 500;
    return res.status(error.statusCode).json({
        success: false,
        message: error.message,
    });
};
export const TryCatch = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch(next);
};
