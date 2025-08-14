// front/src/components/SignupWithVerification.jsx
import React, { useState } from 'react';
import { sendEmailVerification, verifyEmailCode, sendPhoneVerification, verifyPhoneCode } from '../api/verification';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        emailCode: '',
        phoneCode: ''
    });

    const [verificationStatus, setVerificationStatus] = useState({
        emailSent: false,
        phoneSent: false,
        emailVerified: false,
        phoneVerified: false
    });

    // 이메일 인증번호 발송
    const handleSendEmailCode = async () => {
        try {
            const result = await sendEmailVerification(formData.email);
            alert(result.message);
            setVerificationStatus(prev => ({ ...prev, emailSent: true }));
        } catch (error) {
            alert(error.message);
        }
    };

    // 이메일 인증번호 확인
    const handleVerifyEmailCode = async () => {
        try {
            const result = await verifyEmailCode(formData.email, formData.emailCode);
            alert(result.message);
            setVerificationStatus(prev => ({ ...prev, emailVerified: true }));
        } catch (error) {
            alert(error.message);
        }
    };

    // 핸드폰 인증번호 발송
    const handleSendPhoneCode = async () => {
        try {
            const result = await sendPhoneVerification(formData.phoneNumber);
            alert(result.message);
            setVerificationStatus(prev => ({ ...prev, phoneSent: true }));
        } catch (error) {
            alert(error.message);
        }
    };

    // 핸드폰 인증번호 확인
    const handleVerifyPhoneCode = async () => {
        try {
            const result = await verifyPhoneCode(formData.phoneNumber, formData.phoneCode);
            alert(result.message);
            setVerificationStatus(prev => ({ ...prev, phoneVerified: true }));
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="signup-form">
            {/* 이메일 인증 */}
            <div className="verification-section">
                <input
                    type="email"
                    placeholder="이메일 주소"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                <button onClick={handleSendEmailCode} disabled={verificationStatus.emailSent}>
                    {verificationStatus.emailSent ? '인증번호 발송됨' : '인증번호 발송'}
                </button>

                {verificationStatus.emailSent && (
                    <div>
                        <input
                            type="text"
                            placeholder="이메일 인증번호 6자리"
                            value={formData.emailCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, emailCode: e.target.value }))}
                            maxLength={6}
                        />
                        <button onClick={handleVerifyEmailCode} disabled={verificationStatus.emailVerified}>
                            {verificationStatus.emailVerified ? '인증 완료' : '인증 확인'}
                        </button>
                    </div>
                )}
            </div>

            {/* 핸드폰 인증 */}
            <div className="verification-section">
                <input
                    type="tel"
                    placeholder="핸드폰 번호 (010-1234-5678)"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
                <button onClick={handleSendPhoneCode} disabled={verificationStatus.phoneSent}>
                    {verificationStatus.phoneSent ? '인증번호 발송됨' : '인증번호 발송'}
                </button>

                {verificationStatus.phoneSent && (
                    <div>
                        <input
                            type="text"
                            placeholder="SMS 인증번호 6자리"
                            value={formData.phoneCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneCode: e.target.value }))}
                            maxLength={6}
                        />
                        <button onClick={handleVerifyPhoneCode} disabled={verificationStatus.phoneVerified}>
                            {verificationStatus.phoneVerified ? '인증 완료' : '인증 확인'}
                        </button>
                    </div>
                )}
            </div>

            {/* 회원가입 버튼 */}
            <button
                className="signup-btn"
                disabled={!verificationStatus.emailVerified || !verificationStatus.phoneVerified}
            >
                회원가입
            </button>
        </div>
    );
};

export default SignupForm;
