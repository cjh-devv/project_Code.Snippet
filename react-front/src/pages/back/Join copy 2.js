import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TextField, Button, Container, Typography, Box, Card, CardContent, Avatar, IconButton, InputAdornment
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';

function Join() {
    const idRef = useRef(null);
    const pwdRef = useRef(null);
    const pwdCheckRef = useRef(null);
    const nickRef = useRef(null);
    const mailRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // 프로필 이미지 상태
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileFile, setProfileFile] = useState(null);

    // 💡 중복 검사 통과 여부 상태 추가
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isNickChecked, setIsNickChecked] = useState(false);
    const [isMailChecked, setIsMailChecked] = useState(false);

    const navigator = useNavigate();

    // 이미지 변경 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0]; // 단일 파일 객체 추출
        if (file) {
            setProfileFile(file); // FormData에 넣을 파일 객체 저장
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 이미지 초기화 핸들러
    const handleImageReset = (e) => {
        e.stopPropagation();
        setProfileFile(null);
        setProfilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    // 💡 각 필드별 중복 검사 API 호출 함수
    const checkDuplicate = (type, value, setCheckState, fieldName) => {
        if (!value.trim()) {
            alert(`${fieldName}을(를) 입력하세요.`);
            return;
        }
        
        // 예시 주소: 각 프로젝트의 백엔드 엔드포인트에 맞게 수정하세요
        fetch(`http://localhost:3010/user/check-${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [type]: value })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.isAvailable) { // 백엔드에서 사용 가능 여부를 보내준다고 가정
                setCheckState(true);
            }
        })
        .catch(() => alert("중복 검사 중 에러가 발생했습니다."));
    };

    // 회원가입 전송 핸들러 (FormData 방식 전환)
    const handleJoinSubmit = () => {
        // 1. 필수 입력값 및 중복 검사 체크
        if (!idRef.current.value.trim()) { alert("아이디를 입력하세요"); idRef.current.focus(); return; }
        if (!isIdChecked) { alert("아이디 중복 검사를 진행해주세요."); return; }

        if (!nickRef.current.value.trim()) { alert("닉네임을 입력하세요"); nickRef.current.focus(); return; }
        if (!isNickChecked) { alert("닉네임 중복 검사를 진행해주세요."); return; }

        const email = mailRef.current.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) { alert("이메일 주소를 입력하세요"); mailRef.current.focus(); return; }
        if (!emailRegex.test(email)) { alert("이메일 형식이 올바르지 않습니다"); mailRef.current.focus(); return; }
        if (!isMailChecked) { alert("이메일 중복 검사를 진행해주세요."); return; }

        if (!pwdRef.current.value.trim()) { alert("비밀번호를 입력하세요"); pwdRef.current.focus(); return; }
        if (pwdRef.current.value !== pwdCheckRef.current.value) { alert("비밀번호가 일치하지 않습니다"); pwdCheckRef.current.focus(); return; }

        // 💡 2. 파일을 함께 보내기 위해 FormData 객체 생성
        const formData = new FormData();
        formData.append("userId", idRef.current.value);
        formData.append("nickname", nickRef.current.value);
        formData.append("pwd", pwdRef.current.value);
        formData.append("email", mailRef.current.value);
        
        if (profileFile) {
            formData.append("profileImg", profileFile); // 파일 첨부
        }

        // 💡 3. FormData 전송 시 headers에 "Content-Type"을 직접 적지 않아야 브라우저가 boundary를 자동으로 설정합니다.
        fetch("http://localhost:3010/user/join", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.isJoin) {
                navigator("/");
            }
        })
        .catch(err => {
            alert("서버 에러 발생!");
        });
    };
    return (
        <Container maxWidth="xs">
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" backgroundColor="#f8fafc">
                <Card sx={{ width: "100%", borderRadius: 6, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)", p: 1 }}>
                    <CardContent sx={{ p: 4 }}>
                        
                        <Typography variant="h4" fontWeight="900" textAlign="center" color="primary.main" letterSpacing="-1px">
                            Code.Snippet
                        </Typography>
                        <Typography textAlign="center" color="text.secondary" variant="body2" sx={{ mb: 4, mt: 1, fontWeight: 500 }}>
                            더 지혜로운 개발을 위한 코드 아카이빙 플랫폼
                        </Typography>

                        {/* 프로필 이미지 구역 */}
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
                            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, fontWeight: 500 }}>프로필 이미지 설정</Typography>
                        </Box>

                        {/* 입력 필드 구역 */}
                        <Box component="form" noValidate autoComplete="off">
                            
                            {/* 아이디 + 중복확인 버튼 */}
                            <TextField 
                                inputRef={idRef} label="아이디" margin="dense" fullWidth variant="outlined" 
                                onChange={() => setIsIdChecked(false)} // 값 변경 시 중복 체크 초기화
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button size="small" variant="text" sx={{ fontWeight: 'bold' }} onClick={() => checkDuplicate('id', idRef.current.value, setIsIdChecked, '아이디')}>
                                                    {isIdChecked ? "완료" : "중복확인"}
                                                </Button>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            {/* 닉네임 + 중복확인 버튼 */}
                            <TextField 
                                inputRef={nickRef} label="닉네임" margin="dense" fullWidth variant="outlined" 
                                onChange={() => setIsNickChecked(false)}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button size="small" variant="text" sx={{ fontWeight: 'bold' }} onClick={() => checkDuplicate('nickname', nickRef.current.value, setIsNickChecked, '닉네임')}>
                                                    {isNickChecked ? "완료" : "중복확인"}
                                                </Button>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            {/* 이메일 주소 + 중복확인 버튼 */}
                            <TextField 
                                inputRef={mailRef} label="이메일 주소" margin="dense" fullWidth variant="outlined" 
                                onChange={() => setIsMailChecked(false)}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button size="small" variant="text" sx={{ fontWeight: 'bold' }} onClick={() => checkDuplicate('email', mailRef.current.value, setIsMailChecked, '이메일')}>
                                                    {isMailChecked ? "완료" : "중복확인"}
                                                </Button>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            <TextField inputRef={pwdRef} label="비밀번호" type="password" margin="dense" fullWidth variant="outlined" />
                            <TextField inputRef={pwdCheckRef} label="비밀번호 확인" type="password" margin="dense" fullWidth variant="outlined" />

                            <Button variant="contained" fullWidth size="large" sx={{ mt: 4, py: 1.4, borderRadius: 2.5, fontWeight: 'bold', fontSize: '1rem', boxShadow: 'none', backgroundColor: '#1e293b', '&:hover': { backgroundColor: '#0f172a', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' } }} onClick={handleJoinSubmit}>
                                동의하고 가입하기
                            </Button>
                        </Box>

                        <Typography variant="body2" textAlign="center" sx={{ mt: 4, color: 'text.secondary', fontWeight: 500 }}>
                            이미 가입하셨나요?{" "}
                            <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>로그인하기</Link>
                        </Typography>

                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}

export default Join;
