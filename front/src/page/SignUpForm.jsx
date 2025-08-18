import { useCallback, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { sendEmailVerification, sendPhoneVerification, verifyEmailCode, verifyPhoneCode } from "../api/verification";
import "../style/SignUpForm.css";

const API = (process.env.REACT_APP_API_URL || 'http://localhost:3000')
  .trim()
  .replace(/\/+$/, '');


// 키보드 레이아웃 정의 (연속 문자/숫자 검사용)
const keyboardRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

// 키보드에서 연속된 3글자 이상 입력 여부 검사
function isKeyboardSequential(str) {
  const lowerStr = str.toLowerCase();
  for (let i = 0; i < lowerStr.length - 2; i++) {
    const triplet = lowerStr.substr(i, 3);
    if (checkTripletInRow(triplet)) return true;
  }
  return false;
}

// 키보드 한 행에서 연속된 3글자 검사
function checkTripletInRow(triplet) {
  for (const row of keyboardRows) {
    for (let j = 0; j < row.length - 2; j++) {
      const part = row.slice(j, j + 3).join("");
      if (part === triplet || part === triplet.split("").reverse().join("")) {
        return true;
      }
    }
  }
  return false;
}

// 연속/반복 문자/숫자 검사 (abc, 123, aaa 등)
function hasSequentialChars(str, length = 3) {
  // 오름차순 검사
  for (let i = 0; i <= str.length - length; i++) {
    let isSeqAsc = true;
    for (let j = 1; j < length; j++) {
      if (str.charCodeAt(i + j) !== str.charCodeAt(i + j - 1) + 1) {
        isSeqAsc = false;
        break;
      }
    }
    if (isSeqAsc) return true;
  }
  // 내림차순 검사
  for (let i = 0; i <= str.length - length; i++) {
    let isSeqDesc = true;
    for (let j = 1; j < length; j++) {
      if (str.charCodeAt(i + j) !== str.charCodeAt(i + j - 1) - 1) {
        isSeqDesc = false;
        break;
      }
    }
    if (isSeqDesc) return true;
  }
  // 동일 문자 반복 검사
  for (let i = 0; i <= str.length - length; i++) {
    let isRepeat = true;
    for (let j = 1; j < length; j++) {
      if (str[i + j] !== str[i]) {
        isRepeat = false;
        break;
      }
    }
    if (isRepeat) return true;
  }
  return false;
}

// 입력 필드별 안내 메시지
const guideMessages = {
  username: "4~12자 영문/숫자만 입력 가능합니다.",
  password: "영문 대소문자, 숫자, @$!%*?& 포함 8~20자, 아이디 포함 불가",
  email: "올바른 이메일 형식으로 입력해주세요.",
  phone: "01로 시작하는 10-11자리 휴대폰 번호를 입력해주세요.",
};

export default function SignUpForm({ onSubmit }) {
  // 폼 데이터 상태 관리
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordCheck: "",
    email: "",
    phone: "",
    emailCode: "", // 이메일 인증번호
    phoneCode: "", // 핸드폰 인증번호
    agreeTerms: false,
    subscribeTarot: false,
  });

  // 서비스 약관 팝업 창 열기
  const handleTermsClick = () => {
    window.open(
      'https://www.notion.so/PolyTales-2477f78f7b7180beb12fc9a722e95a43?source=copy_link',
      'TermsWindow',
      'width=1000,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=yes,status=no'
    );
  };

  // 중복 확인 메시지 상태
  const [checkMsg, setCheckMsg] = useState("");
  const [checkMsgType, setCheckMsgType] = useState(""); // 'success' | 'error' | ''
  const [emailCheckMsg, setEmailCheckMsg] = useState("");
  const [emailCheckType, setEmailCheckType] = useState(""); // 'success' | 'error'
  const [phoneCheckMsg, setPhoneCheckMsg] = useState("");
  const [phoneCheckType, setPhoneCheckType] = useState(""); // 'success' | 'error'

  // 인증 상태 관리
  const [verificationStatus, setVerificationStatus] = useState({
    emailDuplicateChecked: false,   // 이메일 중복 확인 완료
    phoneDuplicateChecked: false,   // 핸드폰 중복 확인 완료
    emailCodeSent: false,           // 이메일 인증번호 발송 완료
    phoneCodeSent: false,           // 핸드폰 인증번호 발송 완료
    emailVerified: false,           // 이메일 인증 완료
    phoneVerified: false            // 핸드폰 인증 완료
  });

  // 타이머 상태 관리
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [emailExpired, setEmailExpired] = useState(false);
  const [phoneExpired, setPhoneExpired] = useState(false);

  // 시간 포맷 함수 (초 → MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 에러 메시지 상태
  const [errors, setErrors] = useState({});
  // 입력 필드 터치 상태(한번이라도 클릭했나)
  const [touched, setTouched] = useState({});

  // 타이머 관리 useEffect
  useEffect(() => {
    let emailInterval = null;
    let phoneInterval = null;

    // 이메일 타이머
    if (emailTimer > 0) {
      emailInterval = setInterval(() => {
        setEmailTimer(prev => {
          if (prev <= 1) {
            setEmailExpired(true);
            setVerificationStatus(prev => ({
              ...prev,
              emailCodeSent: false,
              emailVerified: false
            }));
            setForm(prev => ({ ...prev, emailCode: "" }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // 핸드폰 타이머
    if (phoneTimer > 0) {
      phoneInterval = setInterval(() => {
        setPhoneTimer(prev => {
          if (prev <= 1) {
            setPhoneExpired(true);
            setVerificationStatus(prev => ({
              ...prev,
              phoneCodeSent: false,
              phoneVerified: false
            }));
            setForm(prev => ({ ...prev, phoneCode: "" }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (emailInterval) clearInterval(emailInterval);
      if (phoneInterval) clearInterval(phoneInterval);
    };
  }, [emailTimer, phoneTimer]);

  // 공통 중복 확인 함수
  const handleDuplicateCheck = async (field, value, setMessage, setType, setStatus = null) => {
    if (!value) {
      setMessage(`✖ ${field === 'username' ? '아이디' : field === 'email' ? '이메일' : '전화번호'}를 입력하세요.`);
      setType("error");
      return;
    }

    try {
      const response = await fetch(`${API}/auth/check-${field}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✔ ${data.message || '사용 가능합니다.'}`);
        setType("success");
        if (setStatus) {
          setStatus(prev => ({ ...prev, [`${field}DuplicateChecked`]: true }));
        }
      } else {
        setMessage(`✖ ${data.message || '이미 사용 중입니다.'}`);
        setType("error");
        if (setStatus) {
          setStatus(prev => ({ ...prev, [`${field}DuplicateChecked`]: false }));
        }
      }
    } catch (error) {
      console.error(`${field} 중복 확인 오류:`, error);
      setMessage("✖ 중복 확인 중 오류가 발생했습니다.");
      setType("error");
      if (setStatus) {
        setStatus(prev => ({ ...prev, [`${field}DuplicateChecked`]: false }));
      }
    }
  };

  // 아이디 중복 확인
  const handleCheckUsername = () => {
    handleDuplicateCheck('username', form.username, setCheckMsg, setCheckMsgType);
  };

  // 이메일 중복 확인
  const handleCheckEmail = () => {
    if (errors.email) return;
    handleDuplicateCheck('email', form.email, setEmailCheckMsg, setEmailCheckType, setVerificationStatus);
  };

  // 전화번호 중복 확인
  const handleCheckPhone = () => {
    if (errors.phone) return;
    handleDuplicateCheck('phone', form.phone, setPhoneCheckMsg, setPhoneCheckType, setVerificationStatus);
  };
  // 이메일 인증번호 발송
  const handleSendEmailCode = async () => {
    try {
      await sendEmailVerification(form.email);
      setEmailCheckMsg("✔ 인증번호가 발송되었습니다.");
      setEmailCheckType("success");
      setVerificationStatus(prev => ({ ...prev, emailCodeSent: true }));
      setEmailTimer(300); // 5분 = 300초
      setEmailExpired(false);
    } catch (error) {
      setEmailCheckMsg(`✖ ${error.message}`);
      setEmailCheckType("error");
    }
  };

  // 이메일 인증번호 확인
  const handleVerifyEmailCode = async () => {
    try {
      await verifyEmailCode(form.email, form.emailCode);
      setEmailCheckMsg("✔ 이메일 인증이 완료되었습니다.");
      setEmailCheckType("success");
      setVerificationStatus(prev => ({ ...prev, emailVerified: true }));
    } catch (error) {
      setEmailCheckMsg(`✖ ${error.message}`);
      setEmailCheckType("error");
    }
  };

  // 핸드폰 인증번호 발송
  const handleSendPhoneCode = async () => {
    try {
      await sendPhoneVerification(form.phone);
      setPhoneCheckMsg("✔ 인증번호가 발송되었습니다.");
      setPhoneCheckType("success");
      setVerificationStatus(prev => ({ ...prev, phoneCodeSent: true }));
      setPhoneTimer(300); // 5분 = 300초
      setPhoneExpired(false);
    } catch (error) {
      setPhoneCheckMsg(`✖ ${error.message}`);
      setPhoneCheckType("error");
    }
  };

  // 핸드폰 인증번호 확인
  const handleVerifyPhoneCode = async () => {
    try {
      await verifyPhoneCode(form.phone, form.phoneCode);
      setPhoneCheckMsg("✔ 핸드폰 인증이 완료되었습니다.");
      setPhoneCheckType("success");
      setVerificationStatus(prev => ({ ...prev, phoneVerified: true }));
    } catch (error) {
      setPhoneCheckMsg(`✖ ${error.message}`);
      setPhoneCheckType("error");
    }
  };

  // 필드별 유효성 검사 함수
  const validateField = useCallback(
    (name, value) => {
      switch (name) {
        case "username":
          if (!value) return "아이디를 입력해주세요.";
          if (!/^[a-zA-Z0-9]{4,12}$/.test(value))
            return "4~12자 영문/숫자만 입력 가능합니다.";
          return "";
        case "password":
          if (!value) return "비밀번호를 입력해주세요.";
          if (form.username && value.toLowerCase().includes(form.username.toLowerCase()))
            return "비밀번호에 아이디를 포함할 수 없습니다.";
          if (isKeyboardSequential(value))
            return "키보드에서 연속된 3자 이상은 사용할 수 없습니다.";
          if (hasSequentialChars(value, 3))
            return "동일하거나 연속된 문자/숫자 3자 이상은 사용할 수 없습니다.";
          if (
            !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/.test(value)
          )
            return "영문자, 숫자, 특수문자(@$!%*?&)를 모두 포함한 8~20자를 입력해주세요.";
          return "";
        case "passwordCheck":
          if (!value) return "비밀번호를 한 번 더 입력해주세요.";
          if (value !== form.password) return "비밀번호가 일치하지 않습니다.";
          return "";
        case "email":
          if (!value) return "이메일을 입력해주세요.";
          if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value))
            return "올바른 이메일 형식으로 입력해주세요.";
          return "";
        case "phone":
          if (!value) return "전화번호를 입력해주세요.";
          if (!/^01[0-9][0-9]{3,4}[0-9]{4}$/.test(value)) return "01로 시작하는 10-11자리 숫자를 입력해주세요.";
          return "";
        default:
          return "";
      }
    },
    [form.password, form.username]
  );

  // 폼 데이터 변경 시 유효성 검사
  useEffect(() => {
    setErrors({
      username: validateField("username", form.username),
      password: validateField("password", form.password),
      passwordCheck: validateField("passwordCheck", form.passwordCheck),
      email: validateField("email", form.email),
      phone: validateField("phone", form.phone),
    });
  }, [form, validateField]);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.replace(/\s/g, ""), // 공백 제거
    }));
    setTouched((prev) => ({
      ...prev,
      [name]: true, // 필드 터치 상태 업데이트
    }));
    // username 입력값이 바뀌면 중복확인 메시지 초기화
    if (name === "username") {
      setCheckMsg("");
      setCheckMsgType("");
    }
    if (name === "email") {
      setEmailCheckMsg("");
      setEmailCheckType("");
      setEmailExpired(false);
      setEmailTimer(0);
      setVerificationStatus(prev => ({
        ...prev,
        emailDuplicateChecked: false,
        emailCodeSent: false,
        emailVerified: false
      }));
    }
    if (name === "phone") {
      setPhoneCheckMsg("");
      setPhoneCheckType("");
      setPhoneExpired(false);
      setPhoneTimer(0);
      setVerificationStatus(prev => ({
        ...prev,
        phoneDuplicateChecked: false,
        phoneCodeSent: false,
        phoneVerified: false
      }));
    }
  };

  // 체크박스 변경 핸들러 (약관/소식 수신)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };




  // 필드 포커스 아웃 핸들러
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      username: validateField("username", form.username),
      password: validateField("password", form.password),
      passwordCheck: validateField("passwordCheck", form.passwordCheck),
      email: validateField("email", form.email),
      phone: validateField("phone", form.phone),
    };
    setErrors(newErrors);
    setTouched({
      username: true,
      password: true,
      passwordCheck: true,
      email: true,
      phone: true,
    });

    if (Object.values(newErrors).every((msg) => !msg) && form.agreeTerms) {
      // 부모 컴포넌트의 onSubmit 함수 호출
      onSubmit({
        username: form.username,
        password: form.password,
        email: form.email,
        phone: form.phone,
        nickname: form.username, // 닉네임을 username과 동일하게 설정
      });
    } else {
      toast.error("모든 필수 항목을 올바르게 입력하고 약관에 동의해주세요.");
    }
  };

  // 개별 필드 유효성 상태
  const isValid = (name) => touched[name] && !errors[name] && form[name];
  // 전체 폼 유효성 상태
  const isAllValid =
    !errors.username &&
    !errors.password &&
    !errors.passwordCheck &&
    !errors.email &&
    !errors.phone &&
    form.username &&
    form.password &&
    form.passwordCheck &&
    form.email &&
    form.phone &&
    form.agreeTerms &&
    verificationStatus.emailVerified &&  // 이메일 인증 완료 필수
    verificationStatus.phoneVerified;     // 핸드폰 인증 완료 필수

  const isUsernameCheckActive = isValid("username") && !checkMsg; // 아이디
  const isEmailCheckActive = isValid("email") && !emailCheckMsg; // 이메일
  const isPhoneCheckActive = isValid("phone") && !phoneCheckMsg; // 전화번호


  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>

      {/* 아이디 입력 섹션 */}
      <div className="input-context">
        <label htmlFor="signup-username">아이디</label>
        <div className="input-area">
          <input
            id="signup-username"
            className="id-input"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
          />
          <button
            type="button"
            className={`id-check${isUsernameCheckActive ? " active" : ""}`}
            onClick={handleCheckUsername}
            disabled={!isUsernameCheckActive}
          >
            중복 확인
          </button>
        </div>
        {!touched.username ? (
          <div className="guideMsg">{guideMessages.username}</div>
        ) : errors.username ? (
          <div className="errMsg">✖ {errors.username}</div>
        ) : (
          <div
            className={
              checkMsgType === "success"
                ? "successMsg"
                : checkMsgType === "error"
                  ? "errMsg"
                  : "successMsg"
            }
          >
            {checkMsgType === "success" && checkMsg
              ? `✔ ${checkMsg}`
              : checkMsgType === "error" && checkMsg
                ? `✖ ${checkMsg}`
                : isValid("username")
                  ? "✔ 아이디를 사용할 수 있습니다."
                  : null}
          </div>
        )}
      </div>

      {/* 비밀번호 입력 섹션 */}
      <div className="input-context">
        <label htmlFor="signup-password">비밀번호</label>
        <div className="input-area">
          <input
            id="signup-password"
            name="password"
            type="password"
            value={form.password}
            maxLength={20}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new-password"
          />
        </div>
        {!touched.password && (
          <div className="guideMsg">{guideMessages.password}</div>
        )}
        {touched.password && errors.password && (
          <div className="errMsg">✖ {errors.password}</div>
        )}
        {isValid("password") && (
          <div className="successMsg">✔ 사용 가능한 비밀번호입니다.</div>
        )}
      </div>

      {/* 비밀번호 확인 섹션 */}
      <div className="input-context">
        <label htmlFor="signup-passwordCheck">비밀번호 확인</label>
        <div className="input-area">
          <input
            id="signup-passwordCheck"
            name="passwordCheck"
            type="password"
            value={form.passwordCheck}
            maxLength={20}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new-password"
          />
        </div>
        {touched.passwordCheck && errors.passwordCheck && (
          <div className="errMsg">✖ {errors.passwordCheck}</div>
        )}
        {isValid("passwordCheck") && (
          <div className="successMsg">✔ 비밀번호가 일치합니다.</div>
        )}
      </div>

      {/* 이메일 입력 섹션 */}
      <div className="input-context">
        <label htmlFor="signup-email">이메일</label>
        <div className="input-area">
          <input
            id="signup-email"
            className="email-input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            disabled={verificationStatus.emailVerified}
          />
          {!verificationStatus.emailDuplicateChecked && (
            <button
              type="button"
              className={`email-check${isEmailCheckActive ? " active" : ""}`}
              onClick={handleCheckEmail}
              disabled={!isEmailCheckActive}
            >
              중복 확인
            </button>
          )}
          {verificationStatus.emailDuplicateChecked && !verificationStatus.emailCodeSent && (
            <button
              type="button"
              className="email-check active"
              onClick={handleSendEmailCode}
            >
              인증번호 발송
            </button>
          )}
          {verificationStatus.emailCodeSent && !verificationStatus.emailVerified && (
            <button
              type="button"
              className="email-check active"
              onClick={handleVerifyEmailCode}
              disabled={!form.emailCode}
            >
              인증 확인
            </button>
          )}
          {verificationStatus.emailVerified && (
            <button
              type="button"
              className="email-check dimmed"
              disabled
            >
              인증 완료
            </button>
          )}
        </div>

        {/* 이메일 인증번호 입력 필드 */}
        {verificationStatus.emailCodeSent && !verificationStatus.emailVerified && (
          <div className="input-area verification-input-area">
            <input
              type="text"
              name="emailCode"
              className="verification-code-input"
              placeholder="이메일 인증번호 6자리"
              value={form.emailCode}
              onChange={handleChange}
              maxLength={6}
            />
            <div className="timer-only-display">
              {emailTimer > 0 ? formatTime(emailTimer) : ''}
            </div>
          </div>
        )}

        {!touched.email && !verificationStatus.emailDuplicateChecked && (
          <div className="guideMsg">{guideMessages.email}</div>
        )}
        {touched.email && errors.email && (
          <div className="errMsg">✖ {errors.email}</div>
        )}
        {emailExpired ? (
          <div className="expired-msg">
            ✖ 인증번호가 만료되었습니다. 인증번호를 다시 발송해 주세요.
          </div>
        ) : emailCheckMsg ? (
          <div
            className={emailCheckType === "success" ? "successMsg" : "errMsg"}
          >
            {emailCheckMsg}
          </div>
        ) : isValid("email") && !verificationStatus.emailDuplicateChecked ? (
          <div className="successMsg">✔ 사용 가능한 이메일입니다.</div>
        ) : null}
      </div>

      {/* 전화번호 입력 섹션 */}
      <div className="input-context">
        <label htmlFor="signup-phone">전화번호</label>
        <div className="input-area">
          <input
            id="signup-phone"
            className="email-input"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            disabled={verificationStatus.phoneVerified}
          />
          {!verificationStatus.phoneDuplicateChecked && (
            <button
              type="button"
              className={`email-check${isPhoneCheckActive ? " active" : ""}`}
              onClick={handleCheckPhone}
              disabled={!isPhoneCheckActive}
            >
              중복 확인
            </button>
          )}
          {verificationStatus.phoneDuplicateChecked && !verificationStatus.phoneCodeSent && (
            <button
              type="button"
              className="email-check active"
              onClick={handleSendPhoneCode}
            >
              인증번호 발송
            </button>
          )}
          {verificationStatus.phoneCodeSent && !verificationStatus.phoneVerified && (
            <button
              type="button"
              className="email-check active"
              onClick={handleVerifyPhoneCode}
              disabled={!form.phoneCode}
            >
              인증 확인
            </button>
          )}
          {verificationStatus.phoneVerified && (
            <button
              type="button"
              className="email-check dimmed"
              disabled
            >
              인증 완료
            </button>
          )}
        </div>

        {/* SMS 인증번호 입력 필드 */}
        {verificationStatus.phoneCodeSent && !verificationStatus.phoneVerified && (
          <div className="input-area verification-input-area">
            <input
              type="text"
              name="phoneCode"
              className="verification-code-input"
              placeholder="SMS 인증번호 6자리"
              value={form.phoneCode}
              onChange={handleChange}
              maxLength={6}
            />
            <div className="timer-only-display">
              {phoneTimer > 0 ? formatTime(phoneTimer) : ''}
            </div>
          </div>
        )}

        {!touched.phone && !verificationStatus.phoneDuplicateChecked && (
          <div className="guideMsg">{guideMessages.phone}</div>
        )}
        {touched.phone && errors.phone && (
          <div className="errMsg">✖ {errors.phone}</div>
        )}
        {phoneExpired ? (
          <div className="expired-msg">
            ✖ 인증번호가 만료되었습니다. 다시 인증번호를 발송해 주세요.
          </div>
        ) : phoneCheckMsg ? (
          <div
            className={phoneCheckType === "success" ? "successMsg" : "errMsg"}
          >
            {phoneCheckMsg}
          </div>
        ) : isValid("phone") && !verificationStatus.phoneDuplicateChecked ? (
          <div className="successMsg">✔ 사용 가능한 전화번호입니다.</div>
        ) : null}
      </div>

      {/* 약관 동의 및 소식 수신 체크박스 섹션 */}
      <div className="terms-area">
        <div className="terms-required">
          <label htmlFor="signup-agreeTerms">
            <input
              id="signup-agreeTerms"
              type="checkbox"
              name="agreeTerms"
              checked={form.agreeTerms}
              onChange={handleCheckboxChange}
              required
            />
            <b className="required-text">[필수]</b>
            <span className="policy-signup" onClick={handleTermsClick}> 서비스 이용약관</span>에 동의합니다
          </label>
        </div>
        <div className="terms-optional">
          <label htmlFor="signup-subscribeTarot">
            <input
              id="signup-subscribeTarot"
              type="checkbox"
              name="subscribeTarot"
              checked={form.subscribeTarot}
              onChange={handleCheckboxChange}
            />
            <b className="optional-text">[선택]</b>{" "}
            <b className="required-text2"> '폴리테일즈의 소식</b>을 받습니다
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isAllValid}
        className={isAllValid ? "" : "dimmed"}
      > 가입하기
      </button>
    </form>
  );
}
