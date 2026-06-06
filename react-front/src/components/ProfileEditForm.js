import React, { useState, useEffect } from 'react';

function ProfileEditForm({ initialNickname, initialImage, onUpdateSuccess }) {
  const [nickname, setNickname] = useState(initialNickname || '');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialImage || '');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isNicknameValid, setIsNicknameValid] = useState(true);
  const DEFAULT_AVATAR = "/assets/default-avatar.png";

  useEffect(() => {
    setNickname(initialNickname);
    setPreviewUrl(initialImage);
  }, [initialNickname, initialImage]);

  // 실시간 글자수 제한 예외 검증 + 중복 체크 디바운싱
  useEffect(() => {
    if (nickname === initialNickname) {
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

    // 0.5초 디바운스 타이머 가동
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 🔥 [변경] axios ➡️ fetch(GET) 변경
        fetch(`/api/users/check-nickname?nickname=${nickname}`, {
          method: "GET",
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
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
  }, [nickname, initialNickname]);

  // 이미지 파일 용량 검증
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("프로필 사진 용량은 2MB를 초과할 수 없습니다.");
        e.target.value = null;
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

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

    // 🔥 [변경] axios.post ➡️ fetch(POST) 변경
    // ⚠️ 주의: FormData를 보낼 때는 headers에 "Content-type"을 수동으로 입력하면 파일 전송이 실패합니다!
    fetch('/api/users/profile-update', {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}` // 토큰 헤더만 정상 전송
        },
        body: formData // JSON.stringify가 아닌 formData 그대로 투척
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('프로필 변경이 성공적으로 저장되었습니다.');
                // 부모 컴포넌트에 실시간 UI 동기화 요청
                onUpdateSuccess(data.nickname, data.profileImage); 
                setImageFile(null);
            } else {
                alert(data.message || '저장 중 오류 발생');
            }
        })
        .catch(err => {
            alert("서버 에러 발생!");
        });
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <img 
          src={previewUrl || DEFAULT_AVATAR} 
          alt="프사 프리뷰" 
          onError={(e) => { e.target.src = DEFAULT_AVATAR; }} 
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <input 
          type="text" 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)} 
          style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <p style={{ fontSize: '12px', color: isNicknameValid ? '#2e7d32' : '#d32f2f', margin: '5px 0 0 0' }}>
          {statusMessage}
        </p>
      </div>

      <button 
        type="submit" 
        disabled={!isNicknameValid}
        style={{
          padding: '10px',
          background: isNicknameValid ? '#007bff' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isNicknameValid ? 'pointer' : 'not-allowed'
        }}
      >
        변경사항 저장하기
      </button>
    </form>
  );
}

export default ProfileEditForm;
