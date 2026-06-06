
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, TextField, Avatar, IconButton, Tabs, Tab } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';

function ProfileEditPage() {
    const navigator = useNavigate(); // 네비게이터 선언
    const DEFAULT_AVATAR = "/logo512.png";
    const location = useLocation();
    // 탭분리
    const [tabValue, setTabValue] = useState(0);
    // 프로필 
    let [info, setInfo] = useState(null);
    const [originNickname, setOriginNickname] = useState(''); //원래 닉넴 입력 닉넴 비교 위해
    const [nickname, setNickname] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(DEFAULT_AVATAR);
    const [isDeleteImage, setIsDeleteImage] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isNicknameValid, setIsNicknameValid] = useState(true);

    // 비밀번호 상태
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 탭 변경 핸들러
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // 비동기 데이터 로딩 완료 여부 체크 플래그
    const [isLoaded, setIsLoaded] = useState(false);

    // 페이지 진입 최초 1회 타이밍에만 전달받은 마이페이지 탭값 대로 이동
    useEffect(() => {
        const passedTab = location.state?.tab;
        // 마이페이지 버튼에서 넘어온 탭 값(0 또는 1)이 확실히 존재할 때만 딱 한 번 실행
        if (passedTab === 0 || passedTab === 1) {
            setTabValue(passedTab);
        }
    }, [location.state]);

    // 1. 페이지가 최초 열릴 때, 기존 유저 데이터를 백엔드에서 조회해와서 input에 채워넣음
    function handleGetMyInfo() {
        fetch("http://localhost:3010/user", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => {

                if (
                    res.status === 401 ||
                    res.status === 403
                ) {

                    alert("로그인이 만료되었습니다.");

                    localStorage.removeItem("token");

                    window.location.href = "/";

                    throw new Error("UNAUTHORIZED");
                }

                return res.json();

            })
            .then(data => {
                setInfo(data);
                console.log("info =", data);
                setOriginNickname(data.userInfo.NICKNAME);
                setNickname(data.userInfo.NICKNAME);

                // DB에 저장된 주소가 있으면 쓰고, 없거나 null이면 프론트 내부 기본 이미지를 매핑
                if (data.profileImage && data.profileImage.trim() !== '') {
                    setPreviewUrl(data.profileImage);
                } else {
                    setPreviewUrl(DEFAULT_AVATAR);
                }
                // 데이터 세팅이 완전히 완료된 직후에만 true로 변경
                setIsLoaded(true);
            })
            .catch(err => {
                if (err.message === "UNAUTHORIZED") {
                    return;
                }
                console.error("기존 프로필 로드 실패:", err);
                alert("사용자 정보를 불러올 수 없습니다.");
                setIsLoaded(true); // 에러가 나도 무한 로딩에 빠지지 않게 해제
            });
    };

    useEffect(() => {
        handleGetMyInfo();
    }, []);

    // 2. 실시간 닉네임 글자수 제한 검증 + 중복 체크 디바운싱
    useEffect(() => {
        // 데이터 로딩이 끝나지 않았거나, 입력값이 없을 때는 중복 체크를 아예 스킵
        if (!isLoaded || !nickname) return;
        // 현재 입력한 값이 서버에서 가져온 내 원래 닉네임과 같다면 중복 체크 스킵
        if (nickname === originNickname) {
            setStatusMessage('');
            setIsNicknameValid(true);
            return;
        }

        const trimmed = nickname.trim();
        if (trimmed.length < 2) {
            setStatusMessage('닉네임은 최소 2자 이상이어야 합니다.');
            setIsNicknameValid(false);
            return;
        }
        if (trimmed.length > 10) {
            setStatusMessage('닉네임은 최대 10자까지만 가능합니다.');
            setIsNicknameValid(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                fetch(`http://localhost:3010/profile/check-nickname?nickname=${nickname}`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        setStatusMessage(data.message);
                        setIsNicknameValid(data.isAvailable);
                    })
                    .catch(err => {
                        setStatusMessage('중복 검사 통신 오류');
                        setIsNicknameValid(false);
                    });
            } catch (error) {
                console.error(error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [nickname, originNickname, isLoaded]);

    // 3. 이미지 용량 검증 및 미리보기
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("프로필 사진 용량은 5MB를 초과할 수 없습니다.");
                e.target.value = null;
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // 고른 파일 즉시 프리뷰 반영
            setIsDeleteImage(false); // 새 파일을 선택했으므로 기본값 복구 플래그는 해제
        }
    };
    // 기본 이미지로 설정 버튼 클릭 시 작동하는 함수
    const handleResetToDefaultImage = () => {
        setImageFile(null); // 전송할 파일 객체 비우기
        setPreviewUrl(DEFAULT_AVATAR); // 화면을 다시 기본 에셋 이미지로 변경
        setIsDeleteImage(true); // 백엔드에 "프사 기본값 복구" 전달하기 위한 플래그 On
    };
    // 4. 프로필 정보 수정
    const handleSave = async (e) => {
        e.preventDefault();

        if (!isNicknameValid) {
            alert("닉네임 상태를 다시 확인해 주세요.");
            return;
        }

        const formData = new FormData();
        formData.append('nickname', nickname);

        // 백엔드로 삭제 요청 여부 전달
        formData.append('isDeleteImage', isDeleteImage);

        if (imageFile) {
            formData.append('profileImg', imageFile);
        }

        const token = localStorage.getItem('token');

        fetch('http://localhost:3010/profile/update', {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('프로필 변경이 완료되었습니다!');
                    navigator("/mypage");
                } else {
                    alert(data.message || '저장 중 오류 발생');
                }
            })
            .catch(err => {
                alert("서버 에러 발생!");
            });
    };

    // 비밀번호 저장
    const handleSavePassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("새 비밀번호 확인이 일치하지 않습니다.");
            return;
        }
        const token = localStorage.getItem('token');
        fetch('http://localhost:3010/user/password-update', {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('비밀번호가 안전하게 변경되었습니다.');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                } else { alert(data.message); }
            }).catch(() => alert("서버 오류"));
    };

    // 데이터가 다 불러오기 전까지는 로딩 화면
    if (!isLoaded) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <Typography variant="h6" color="textSecondary">프로필 정보를 불러오는 중...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                maxWidth: 700,
                margin: '50px auto',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
                backgroundColor: '#fff',
                overflow: 'hidden'
            }}>
            {/* 좌측 탭 메뉴 내비게이션 구역 */}
            <Tabs
                orientation="vertical"
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                    borderRight: 1,
                    borderColor: 'divider',
                    minWidth: 160,
                    backgroundColor: '#f8f9fa',
                    '.MuiTab-root': { alignItems: 'flex-start', pl: 3, textTransform: 'none', fontWeight: '600' }
                }}
            >
                <Tab icon={<AccountCircleIcon fontSize="small" />} iconPosition="start" label="프로필 수정" />
                <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="비밀번호 변경" />
            </Tabs>

            {/* 우측 실제 서브 화면 (컨텐츠 패널) */}
            <Box sx={{ flexGrow: 1, padding: 4 }}>

                {/* [TAB 0] 프로필 수정 폼 화면 */}
                {tabValue === 0 && (
                    <Box component="form" onSubmit={handleSave} display="flex" flexDirection="column" gap={3}>
                        <Typography variant="h6" fontWeight="bold">프로필 수정</Typography>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                            <Box position="relative">
                                <Avatar src={previewUrl} sx={{ width: 100, height: 100, border: '1px solid #e0e0e0' }} />
                                <IconButton component="label" sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007bff', color: '#fff', '&:hover': { backgroundColor: '#0056b3' }, width: 30, height: 30 }}>
                                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                            {previewUrl !== DEFAULT_AVATAR && (
                                <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleResetToDefaultImage} sx={{ borderRadius: 2, fontSize: '11px', py: 0.2 }}>
                                    기본 이미지로 변경
                                </Button>
                            )}
                        </Box>
                        <TextField label="닉네임 (2~10자)" variant="outlined" value={nickname} onChange={(e) => setNickname(e.target.value)} fullWidth error={!isNicknameValid && statusMessage !== ''} helperText={statusMessage} FormHelperTextProps={{ sx: { color: isNicknameValid ? '#2e7d32' : '#d32f2f' } }} />
                        <Button type="submit" variant="contained" color="primary" fullWidth disabled={!isNicknameValid} sx={{ py: 1.2, fontWeight: 'bold' }}>프로필 저장</Button>
                    </Box>
                )}

                {/* [TAB 1] 비밀번호 안전 변경 화면 */}
                {tabValue === 1 && (
                    <Box component="form" onSubmit={handleSavePassword} display="flex" flexDirection="column" gap={2.5}>
                        <Typography variant="h6" fontWeight="bold">비밀번호 변경</Typography>
                        <TextField label="현재 비밀번호" type="password" variant="outlined" fullWidth value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <TextField label="새 비밀번호" type="password" variant="outlined" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <TextField label="새 비밀번호 확인" type="password" variant="outlined" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ py: 1.2, fontWeight: 'bold', backgroundColor: '#495057', '&:hover': { backgroundColor: '#343a40' } }}>비밀번호 수정</Button>
                    </Box>
                )}

                <Button variant="text" fullWidth onClick={() => navigator("/mypage")} sx={{ mt: 4, color: '#888', fontSize: '13px' }}>마이페이지로 되돌아가기</Button>
            </Box>
        </Box>
    );
}

export default ProfileEditPage;
