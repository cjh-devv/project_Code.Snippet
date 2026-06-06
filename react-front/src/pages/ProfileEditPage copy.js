import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🔥 페이지 이동을 위한 훅 임포트

function ProfileEditPage() {
    const navigator = useNavigate(); // 🔥 네비게이터 선언
    const DEFAULT_AVATAR = "/logo512.png";
    let [info, setInfo] = useState(null);
    const [originNickname, setOriginNickname] = useState(''); //원래 닉넴 입력 닉넴 비교 위해
    const [nickname, setNickname] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(DEFAULT_AVATAR);

    const [statusMessage, setStatusMessage] = useState('');
    const [isNicknameValid, setIsNicknameValid] = useState(true);

    // 비동기 데이터 로딩 완료 여부 체크 플래그
    const [isLoaded, setIsLoaded] = useState(false);

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

                
                // 백엔드에서 받은 이미지 주소가 유효한지 검증
                const targetImgUrl = data.profileImage ? data.profileImage : DEFAULT_AVATAR;
                setIsLoaded(true); // 로딩 완료 신호  
                // 메모리에 가상 이미지 객체를 만들어 로딩.
                const img = new Image();
                img.src = targetImgUrl;

                // 브라우저가 이미지를 완전히 다운로드 받아 준비가 완료된 순간!
                img.onload = () => {
                    setPreviewUrl(targetImgUrl);
                    setIsLoaded(true); // 모든 데이터와 이미지가 준비되었을 때만 로딩 플래그 완료 처리
                };

                // 만약 서버의 파일 경로가 깨져서 이미지 로딩에 실패한 경우 안전하게 기본값 처리
                img.onerror = () => {
                    setPreviewUrl(DEFAULT_AVATAR);
                    setIsLoaded(true);
                };
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
        }
    };

    // 4. 프로필 정보 수정 처리 요청
    const handleSave = async (e) => {
        e.preventDefault();

        if (!isNicknameValid) {
            alert("닉네임 상태를 다시 확인해 주세요.");
            return;
        }

        const formData = new FormData();
        formData.append('nickname', nickname);
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

    // 데이터가 다 불러오기 전까지는 로딩 화면
    if (!isLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <h3 style={{ color: '#666' }}>프로필 정보를 불러오는 중입니다...</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: '30px', maxWidth: '500px', margin: '50px auto', border: '1px solid #eee', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '25px' }}>프로필 수정</h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <img
                        src={previewUrl || DEFAULT_AVATAR}
                        alt="프사 프리뷰"
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
                    />
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>닉네임 설정 (2~10자)</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <p style={{ fontSize: '12px', color: isNicknameValid ? '#2e7d32' : '#d32f2f', margin: '5px 0 0 0' }}>
                        {statusMessage}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        type="button"
                        onClick={() => navigator("/mypage")} // 취소 시 되돌아가기
                        style={{ flex: 1, padding: '12px', background: '#f4f4f4', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={!isNicknameValid}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: isNicknameValid ? '#007bff' : '#ccc',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isNicknameValid ? 'pointer' : 'not-allowed'
                        }}
                    >
                        저장 완료
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEditPage;
