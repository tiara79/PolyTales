const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');

// 인증 코드 저장소 (실제로는 Redis 사용 권장)
const verificationCodes = new Map();

// 인증 코드 생성 (6자리 숫자)
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Gmail SMTP 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});


// 핸드폰 번호 포맷팅 (010-1254-5678 → +821012545678)
const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('010')) {
        return `+82${cleaned.substring(1)}`;
    }
    return phoneNumber;
};

//------------------ 이메일 인증 --------------------
// 이메일 인증번호 발송
const sendEmailVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: '이메일을 입력해주세요.'
            });
        }

        // 이메일 중복 체크
        const existingUser = await User.findOne({
            where: {
                email,
                status: { [Op.ne]: 5 }
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 이메일입니다.'
            });
        }

        // 인증 코드 생성 및 저장
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

        verificationCodes.set(email, {
            code: verificationCode,
            expiresAt,
            attempts: 0
        });

        // 이메일 발송
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: email,
                subject: '[PolyTales] 이메일 인증번호',
                html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #555; text-align: center;">PolyTales 이메일 인증</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
              <h5 style="color: #67b98a; margin: 0 0 15px 0;">인증번호</h5>
              <div style="font-size: 52px; font-weight: bold; color: #555; letter-spacing: 5px; margin: 20px 0;">
                ${verificationCode}
              </div>
              <p style="color: #666; margin: 15px 0 0 0;">
                인증번호는 <strong>5분간</strong> 유효합니다.
              </p>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
              본인이 요청하지 않았다면 이 이메일을 무시해주세요.
            </p>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);
        } else {
            // 개발 환경에서는 콘솔에 출력
            console.log(`📧 이메일 인증번호 발송 시뮬레이션:`);
            console.log(`   이메일: ${email}`);
            console.log(`   인증번호: ${verificationCode}`);
            console.log(`   만료시간: ${expiresAt.toLocaleString()}`);
        }

        res.json({
            success: true,
            message: '이메일로 인증번호가 발송되었습니다. 5분 내에 입력해주세요.',
            expiresAt,
            // 개발 환경에서만 코드 노출
            ...(process.env.NODE_ENV !== 'production' && { code: verificationCode })
        });

    } catch (error) {
        console.error('이메일 인증번호 발송 실패:', error);
        res.status(500).json({
            success: false,
            message: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
};

// 이메일 인증번호 확인
const verifyEmailCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: '이메일과 인증번호를 모두 입력해주세요.'
            });
        }

        const verification = verificationCodes.get(email);

        if (!verification) {
            return res.status(400).json({
                success: false,
                message: '인증 요청을 찾을 수 없습니다. 인증번호를 다시 요청해주세요.'
            });
        }

        // 만료 시간 체크
        if (new Date() > verification.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: '인증번호가 만료되었습니다. 다시 요청해주세요.'
            });
        }

        // 시도 횟수 체크
        if (verification.attempts >= 5) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: '인증 시도 횟수를 초과했습니다. 다시 요청해주세요.'
            });
        }

        // 코드 확인
        if (verification.code !== code.toString()) {
            verification.attempts++;
            return res.status(400).json({
                success: false,
                message: `인증번호가 틀렸습니다. ${verification.attempts}번째 시도 (5번 초과시 재발송 필요)`
            });
        }

        // 인증 성공
        verificationCodes.delete(email);

        res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.',
            verifiedEmail: email
        });

    } catch (error) {
        console.error('이메일 인증 확인 실패:', error);
        res.status(500).json({
            success: false,
            message: '인증 확인에 실패했습니다.'
        });
    }
};

//------------------ 핸드폰 인증 --------------------
// 핸드폰 인증번호 발송
const sendPhoneVerification = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: '전화번호를 입력해주세요.'
            });
        }

        // 핸드폰 번호 포맷팅
        const formattedPhone = formatPhoneNumber(phoneNumber);

        // 핸드폰 번호 중복 체크
        const existingUser = await User.findOne({
            where: {
                phone: formattedPhone,
                status: { [Op.ne]: 5 }
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 전화번호입니다.'
            });
        }

        // 인증 코드 생성 및 저장
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

        verificationCodes.set(formattedPhone, {
            code: verificationCode,
            expiresAt,
            attempts: 0
        });

        // SMS 발송 (Twilio Verify 또는 일반 SMS API)
        console.log(' SMS 발송 시도 - 환경변수 확인:');
        console.log(`   TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '설정됨' : '없음'}`);
        console.log(`   TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '설정됨' : '없음'}`);
        console.log(`   TWILIO_VERIFY_SERVICE_SID: ${process.env.TWILIO_VERIFY_SERVICE_SID ? '설정됨 (Verify 사용)' : '없음'}`);
        console.log(`   TWILIO_FROM_NUMBER: ${process.env.TWILIO_FROM_NUMBER ? process.env.TWILIO_FROM_NUMBER : '없음'}`);
        console.log(`   받는 번호: ${formattedPhone}`);

        // 1. Twilio Verify 서비스 우선 사용 (더 안정적이고 전화번호 구매 불필요)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
            try {
                const twilio = require('twilio');
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

                console.log(' Twilio Verify SMS 발송 시작...');
                const verification = await client.verify.v2
                    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verifications
                    .create({
                        to: formattedPhone,
                        channel: 'sms'
                    });

                console.log(` Twilio Verify SMS 발송 성공!`);
                console.log(`   Verification SID: ${verification.sid}`);
                console.log(`   Status: ${verification.status}`);
                console.log(`   받는 번호: ${formattedPhone}`);

                // Twilio Verify는 자체적으로 인증번호를 관리하므로 우리가 생성한 코드 삭제
                verificationCodes.delete(formattedPhone);

            } catch (twilioError) {
                console.error(' Twilio Verify SMS 발송 실패:', twilioError.message);
                console.error('   Error Code:', twilioError.code);
                console.error('   More Info:', twilioError.moreInfo);
                // Verify 실패시 일반 SMS로 폴백
                console.log(' 일반 SMS API로 폴백 시도...');
                await sendRegularSMS();
            }
        }
        // 2. 일반 Twilio SMS API 사용 (메시지 커스터마이징 가능, 전화번호 필요)
        else if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
            await sendRegularSMS();
        }
        // 3. SMS 서비스가 설정되지 않은 경우
        else if (process.env.NODE_ENV === 'production') {
            // 프로덕션에서 다른 SMS 서비스 사용
            if (process.env.COOLSMS_API_KEY) {
                // 쿨SMS 사용
                const coolsms = require('coolsms-node-sdk').default;
                const messageService = new coolsms(process.env.COOLSMS_API_KEY, process.env.COOLSMS_API_SECRET);

                await messageService.sendOne({
                    to: formattedPhone,
                    from: process.env.SMS_SENDER_NUMBER,
                    text: `[PolyTales] 인증번호: ${verificationCode} (5분간 유효)`
                });
            }
        } else {
            // 개발 환경에서 SMS 설정이 없으면 콘솔에 출력
            console.log(`   SMS 발송 시뮬레이션:`);
            console.log(`   번호: ${formattedPhone}`);
            console.log(`   인증번호: ${verificationCode}`);
            console.log(`   만료시간: ${expiresAt.toLocaleString()}`);
        }

        // 일반 SMS 발송 함수
        async function sendRegularSMS() {
            try {
                const twilio = require('twilio');
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

                console.log(' Twilio 일반 SMS 발송 시작...');
                const message = await client.messages.create({
                    from: process.env.TWILIO_FROM_NUMBER,
                    to: formattedPhone,
                    body: `\n=== PolyTales 인증 ===\n인증번호: ${verificationCode}\n5분 내에 입력해주세요.\n==================`
                });

                console.log(` Twilio 일반 SMS 발송 성공!`);
                console.log(`   Message SID: ${message.sid}`);
                console.log(`   Status: ${message.status}`);
                console.log(`   받는 번호: ${formattedPhone}`);
                console.log(`   인증번호: ${verificationCode}`);

            } catch (twilioError) {
                console.error(' Twilio 일반 SMS 발송 실패:', twilioError.message);
                console.error('   Error Code:', twilioError.code);
                console.error('   More Info:', twilioError.moreInfo);
                // SMS 발송 실패시 콘솔 출력
                console.log(` SMS 발송 시뮬레이션 (Twilio 실패):`);
                console.log(`   번호: ${formattedPhone}`);
                console.log(`   인증번호: ${verificationCode}`);
                console.log(`   만료시간: ${expiresAt.toLocaleString()}`);
            }
        } res.json({
            success: true,
            message: ' SMS로 인증번호가 발송되었습니다. 5분 내에 입력해주세요.',
            expiresAt,
            // 개발 환경에서만 코드 노출
            ...(process.env.NODE_ENV !== 'production' && { code: verificationCode })
        });

    } catch (error) {
        console.error('SMS 발송 실패:', error);
        res.status(500).json({
            success: false,
            message: 'SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
};

// 핸드폰 인증번호 확인
const verifyPhoneCode = async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;

        if (!phoneNumber || !code) {
            return res.status(400).json({
                success: false,
                message: '전화번호와 인증번호를 모두 입력해주세요.'
            });
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);

        // 1. Twilio Verify 서비스 사용 시 (우선순위)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
            try {
                const twilio = require('twilio');
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

                console.log(' Twilio Verify 인증 확인 시작...');
                const verificationCheck = await client.verify.v2
                    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verificationChecks
                    .create({
                        to: formattedPhone,
                        code: code
                    });

                console.log(` Twilio Verify 인증 확인:`, verificationCheck.status);

                if (verificationCheck.status === 'approved') {
                    return res.json({
                        success: true,
                        message: ' 핸드폰 인증이 완료되었습니다.'
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: '인증번호가 일치하지 않습니다.'
                    });
                }
            } catch (twilioError) {
                console.error(' Twilio Verify 인증 확인 실패:', twilioError.message);
                console.log(' 일반 인증 방식으로 폴백...');
                // Verify 실패시 일반 방식으로 폴백
            }
        }

        // 2. 일반 인증번호 확인 (우리가 생성한 코드 사용)
        const verification = verificationCodes.get(formattedPhone);

        if (!verification) {
            return res.status(400).json({
                success: false,
                message: '인증 요청을 찾을 수 없습니다. 인증번호를 다시 요청해주세요.'
            });
        }

        // 만료 시간 체크
        if (new Date() > verification.expiresAt) {
            verificationCodes.delete(formattedPhone);
            return res.status(400).json({
                success: false,
                message: '인증번호가 만료되었습니다. 다시 요청해주세요.'
            });
        }

        // 시도 횟수 체크
        if (verification.attempts >= 5) {
            verificationCodes.delete(formattedPhone);
            return res.status(400).json({
                success: false,
                message: '인증 시도 횟수를 초과했습니다. 다시 요청해주세요.'
            });
        }

        // 코드 확인
        if (verification.code !== code.toString()) {
            verification.attempts++;
            return res.status(400).json({
                success: false,
                message: `인증번호가 틀렸습니다. ${verification.attempts}번째 시도 (5번 초과시 재발송 필요)`
            });
        }

        // 인증 성공
        verificationCodes.delete(formattedPhone);

        res.json({
            success: true,
            message: '휴대폰 인증이 완료되었습니다.',
            verifiedPhone: formattedPhone
        });

    } catch (error) {
        console.error('휴대폰 인증 확인 실패:', error);
        res.status(500).json({
            success: false,
            message: '인증 확인에 실패했습니다.'
        });
    }
};

module.exports = {
    sendEmailVerification,
    verifyEmailCode,
    sendPhoneVerification,
    verifyPhoneCode
};
