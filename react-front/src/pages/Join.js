import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TextField, Button, Container, Typography, Box, Card, CardContent, Avatar, IconButton,
    InputAdornment
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CodeIcon from '@mui/icons-material/Code';


function Join() {
    const [form, setForm] = useState({ id: "", nick: "", mail: "", pwd: "", pwdCheck: "" });
    const [errors, setErrors] = useState({ id: "", nick: "", mail: "", pwd: "", pwdCheck: "" });
    const [isValids, setIsValids] = useState({ id: false, nick: false, mail: false, pwd: false, pwdCheck: false });

    // 공통 스타일 변수
    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }, // 기본 테두리
            '&:hover fieldset': { borderColor: '#818cf8' },             // 마우스 호버
            '&.Mui-focused fieldset': { borderColor: '#818cf8' },       // 포커스 시 보라색
        },
        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#818cf8' },
        '& .MuiFormHelperText-root': { color: '#f87171' }               // 에러 메시지 붉은색
    };

    // 프로필 이미지 상태
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const fileInputRef = useRef(null);
    const navigator = useNavigate();

    // 이미지 변경 및 용량 제한(5MB) 체크
    const handleImageChange = (e) => {
        const file = e.target.files[0]; // 단일 파일 객체 추출
        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5MB를 바이트 단위로 계산

            if (file.size > maxSize) {
                alert("프로필 사진은 5MB 이하의 파일만 업로드 가능합니다.");
                if (fileInputRef.current) fileInputRef.current.value = ""; // 선택 파일 초기화
                return;
            }

            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfilePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // 이미지 초기화 핸들러
    const handleImageReset = (e) => {
        e.stopPropagation();
        setProfileFile(null);
        setProfilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    // 입력값 변경 시 실시간 유효성 검사 수행
    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));

        let errorMsg = "";
        let isValid = false;

        if (field === "id") {
            if (!value.trim()) errorMsg = "아이디를 입력해주세요.";
            else if (value.length < 4) errorMsg = "아이디는 4자 이상이어야 합니다.";
            else isValid = true;
            setErrors(prev => ({ ...prev, id: errorMsg }));
            setIsValids(prev => ({ ...prev, id: isValid }));
        }

        // 닉네임 유효성 검사 규칙 (2자 ~ 10자)
        if (field === "nick") {
            if (!value.trim()) {
                errorMsg = "닉네임을 입력해주세요.";
            } else if (value.length < 2 || value.length > 10) {
                errorMsg = "닉네임은 2자 이상 10자 이하로 입력해주세요.";
            } else {
                isValid = true;
            }
            setErrors(prev => ({ ...prev, nick: errorMsg }));
            setIsValids(prev => ({ ...prev, nick: isValid }));
        }

        if (field === "mail") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value.trim()) errorMsg = "이메일을 입력해주세요.";
            else if (!emailRegex.test(value)) errorMsg = "올바른 이메일 형식이 아닙니다.";
            else isValid = true;
            setErrors(prev => ({ ...prev, mail: errorMsg }));
            setIsValids(prev => ({ ...prev, mail: isValid }));
        }

        if (field === "pwd") {
            if (!value.trim()) errorMsg = "비밀번호를 입력해주세요.";
            else if (value.length < 4) errorMsg = "비밀번호는 4자 이상이어야 합니다.";
            else isValid = true;
            setErrors(prev => ({ ...prev, pwd: errorMsg }));
            setIsValids(prev => ({ ...prev, pwd: isValid }));

            if (form.pwdCheck && value !== form.pwdCheck) {
                setErrors(prev => ({ ...prev, pwdCheck: "비밀번호가 일치하지 않습니다." }));
                setIsValids(prev => ({ ...prev, pwdCheck: false }));
            }
        }

        if (field === "pwdCheck") {
            if (!value.trim()) errorMsg = "비밀번호 확인을 입력해주세요.";
            else if (value !== form.pwd) errorMsg = "비밀번호가 일치하지 않습니다.";
            else isValid = true;
            setErrors(prev => ({ ...prev, pwdCheck: errorMsg }));
            setIsValids(prev => ({ ...prev, pwdCheck: isValid }));
        }
    };

    // 회원가입 완료
    const handleJoinSubmit = () => {
        if (!isValids.id || !isValids.nick || !isValids.mail || !isValids.pwd || !isValids.pwdCheck) {
            alert("입력 항목을 다시 확인하고 올바르게 채워주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("userId", form.id);
        formData.append("nickname", form.nick);
        formData.append("pwd", form.pwd);
        formData.append("email", form.mail);
        if (profileFile) formData.append("profileImg", profileFile);

        fetch("http://localhost:3010/user/join", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.result) navigator("/");
            })
            .catch(() => alert("서버 에러 발생!"));
    };
    return (
        <Container maxWidth="xs">
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" >
                <Card sx={{
                    width: "100%",
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.05)', // 반투명 화이트
                    backdropFilter: 'blur(10px)',            // 흐림 효과
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}>
                    <CardContent sx={{ p: 4 }}>

                        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1}>
                            <CodeIcon sx={{ color: '#818cf8', fontSize: 32 }} />
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                textAlign="center"
                                sx={{
                                    fontFamily: 'Courier New, Courier, monospace',
                                    color: '#ffffff',
                                    letterSpacing: '1px'
                                }}
                            >
                                Code.Snippet
                            </Typography>
                        </Box>
                        <Typography textAlign="center" color="text.secondary" variant="body2" sx={{ mb: 4, mt: 1, fontWeight: 500 }}>
                            더 지혜로운 개발을 위한 코드 아카이빙 플랫폼
                        </Typography>

                        {/* 프로필 사진 디자인 구역 */}
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 3 }}>
                            <Box position="relative">
                                <Avatar src={profilePreview} sx={{ width: 96, height: 96, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "3px solid #fff", backgroundColor: "#f1f5f9" }} />
                                {profilePreview && (
                                    <IconButton size="small" sx={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', color: '#fff', boxShadow: "0 2px 8px rgba(239,68,68,0.3)", width: 24, height: 24, '&:hover': { backgroundColor: '#dc2626' } }} onClick={handleImageReset}>
                                        <CloseIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                )}
                                <IconButton color="primary" component="label" sx={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#fff', boxShadow: "0 2px 8px rgba(0,0,0,0.1)", '&:hover': { backgroundColor: '#f8fafc' }, width: 32, height: 32 }} onClick={() => fileInputRef.current.click()}>
                                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>
                            {/* accept="image/*"로 이미지 파일만 선택하도록 유도 */}
                            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>프로필 이미지 설정 (최대 5MB)</Typography>
                        </Box>

                        {/* 입력 폼 구역 */}
                        <Box component="form" noValidate autoComplete="off">
                            <TextField
                                label="아이디" margin="dense" fullWidth variant="outlined"
                                value={form.id} onChange={(e) => handleInputChange("id", e.target.value)}
                                error={!!errors.id} helperText={errors.id}
                                sx={inputStyle}
                                slotProps={{
                                    inputLabel: { style: { color: 'rgba(255, 255, 255, 0.6)' } },
                                    htmlInput: { style: { color: '#ffffff' } } // 글자 타이핑 시 흰색으로 나오도록 보완
                                }}
                            />
                            <TextField
                                label="닉네임" margin="dense" fullWidth variant="outlined"
                                value={form.nick} onChange={(e) => handleInputChange("nick", e.target.value)}
                                error={!!errors.nick} helperText={errors.nick}
                                sx={inputStyle}
                                slotProps={{
                                    inputLabel: { style: { color: 'rgba(255, 255, 255, 0.6)' } },
                                    htmlInput: { style: { color: '#ffffff' } } // 글자 타이핑 시 흰색으로 나오도록 보완
                                }}
                            />
                            <TextField
                                label="이메일 주소" margin="dense" fullWidth variant="outlined"
                                value={form.mail} onChange={(e) => handleInputChange("mail", e.target.value)}
                                error={!!errors.mail} helperText={errors.mail}
                                sx={inputStyle}
                                slotProps={{
                                    inputLabel: { style: { color: 'rgba(255, 255, 255, 0.6)' } },
                                    htmlInput: { style: { color: '#ffffff' } } // 글자 타이핑 시 흰색으로 나오도록 보완
                                }}
                            />
                            <TextField
                                label="비밀번호" type="password" margin="dense" fullWidth variant="outlined"
                                value={form.pwd} onChange={(e) => handleInputChange("pwd", e.target.value)}
                                error={!!errors.pwd} helperText={errors.pwd}
                                sx={inputStyle}
                                slotProps={{
                                    inputLabel: { style: { color: 'rgba(255, 255, 255, 0.6)' } },
                                    htmlInput: { style: { color: '#ffffff' } } // 글자 타이핑 시 흰색으로 나오도록 보완
                                }}
                            />
                            <TextField
                                label="비밀번호 확인" type="password" margin="dense" fullWidth variant="outlined"
                                value={form.pwdCheck} onChange={(e) => handleInputChange("pwdCheck", e.target.value)}
                                error={!!errors.pwdCheck} helperText={errors.pwdCheck}
                                sx={inputStyle}
                                slotProps={{
                                    inputLabel: { style: { color: 'rgba(255, 255, 255, 0.6)' } },
                                    htmlInput: { style: { color: '#ffffff' } } // 글자 타이핑 시 흰색으로 나오도록 보완
                                }}
                            />

                            <Button variant="contained" fullWidth size="large" sx={{
                                mt: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', // 그라데이션
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)',
                                    transform: 'translateY(-1px)', // 마우스 올리면 1픽셀 위로 살짝 들림
                                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                                }
                            }} onClick={handleJoinSubmit}>
                                가입하기
                            </Button>
                        </Box>

                        <Typography variant="body2" textAlign="center" sx={{ mt: 3, color: 'rgba(255, 255, 255, 0.5)' }}>
                            이미 가입하셨나요?{" "}
                            <Link to="/" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold' }}>로그인하기</Link>
                        </Typography>

                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}

export default Join;
