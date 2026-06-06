import React, { createContext, useState, useEffect } from 'react';

// 1. 컨텍스트 생성
export const UserContext = createContext(null);

// 2. 전체 앱을 감싸줄 공급자(Provider) 컴포넌트
export function UserProvider({ children }) {
    const [globalUserInfo, setGlobalUserInfo] = useState(null);

    // 로그인 직후나 앱 새로고침 시 유저 정보를 백엔드에서 가져와 전역에 박는 함수
    const refreshUserInfo = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("http://localhost:3010/user", {
            headers: { "Authorization": "Bearer " + token }
        })
        .then(res => res.json())
        .then(data => {
            // 비밀번호를 제외한 유저 정보 객체 전체를 전역 상태에 보관
            if (data && data.userInfo) {
                const { PASSWORD_HASH, ...safeUserInfo } = data.userInfo;
                setGlobalUserInfo(safeUserInfo);
            }
        })
        .catch(err => console.error("전역 유저 정보 로드 실패:", err));
    };

    useEffect(() => {
        refreshUserInfo();
    }, []);

    // 로그아웃 시 전역 상태를 비워줌
    const clearUserInfo = () => {
        setGlobalUserInfo(null);
    };

    return (
        // 전역 변수(globalUserInfo)와 갱신 함수(refreshUserInfo)를 하위 모든 컴포넌트에 주입 + 클리어
        <UserContext.Provider value={{ globalUserInfo, refreshUserInfo, clearUserInfo }}>
            {children}
        </UserContext.Provider>
    );
}
