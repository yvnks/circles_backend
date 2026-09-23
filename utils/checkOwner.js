import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';

const checkOwner = (instance, req, statusCode, next) => {
  if (instance.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new CustomErrorHandlerAPI(
        `You do not have the right permissions`,
        statusCode, 
      ),
    );
  }
};

export default checkOwner;
