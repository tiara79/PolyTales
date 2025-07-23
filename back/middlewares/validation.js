// File: back/middlewares/validation.js
const {registerSchema} = require("../util/validation");

const validateRegister = (req,res, next)=>{
  // registerSchema를 이용해서 입력 데이터를 검증 합니다.
  const {error} = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message : error,
    });
  }
  next(); // 다음 미들웨어나 컨트롤러로 이동합니다.
}

module.exports ={
  validateRegister,
}