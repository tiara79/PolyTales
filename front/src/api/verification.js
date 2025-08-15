import axios from './axios';

// 이메일 인증번호 발송
export const sendEmailVerification = async (email) => {
    try {
        const response = await axios.post('/verification/email/send', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: '이메일 발송에 실패했습니다.' };
    }
};

// 이메일 인증번호 확인
export const verifyEmailCode = async (email, code) => {
    try {
        const response = await axios.post('/verification/email/verify', {
            email,
            code
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: '인증 확인에 실패했습니다.' };
    }
};

// 핸드폰 인증번호 발송
export const sendPhoneVerification = async (phoneNumber) => {
    try {
        const response = await axios.post('/verification/phone/send', { phoneNumber });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'SMS 발송에 실패했습니다.' };
    }
};

// 핸드폰 인증번호 확인
export const verifyPhoneCode = async (phoneNumber, code) => {
    try {
        const response = await axios.post('/verification/phone/verify', {
            phoneNumber,
            code
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: '인증 확인에 실패했습니다.' };
    }
};
