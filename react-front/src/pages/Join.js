import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
    let idRef = useRef("");
    let pwdRef = useRef("");
    let nickRef = useRef("");
    let mailRef = useRef("");
    let navigator = useNavigate();

    return (
        <Container maxWidth="xs">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Typography variant="h4" gutterBottom>
                    회원가입
                </Typography>
                <TextField inputRef={idRef} label="Id" variant="outlined" margin="normal" fullWidth />
                <TextField inputRef={nickRef} label="Nickname" variant="outlined" margin="normal" fullWidth />
                <TextField inputRef={mailRef} label="e-mail" variant="outlined" margin="normal" fullWidth />
                <TextField
                    inputRef={pwdRef}
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    type="password"
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginTop: '20px' }}
                    onClick={() => {


                        if (!idRef.current.value.trim()) {
                            alert("아이디를 입력하세요");
                            idRef.current.focus();
                            return;
                        }
                        if (!nickRef.current.value.trim()) {
                            alert("닉네임을 입력하세요");
                            nickRef.current.focus();
                            return;
                        }

                        const email = mailRef.current.value;

                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                        // 이메일 공백 체크
                        if (!email.trim()) {
                            alert("이메일 주소를 입력하세요");
                            mailRef.current.focus();
                            return;
                        }

                        // 이메일 형식 체크
                        if (!emailRegex.test(email)) {
                            alert("이메일 형식이 올바르지 않습니다");
                            mailRef.current.focus();
                            return;
                        }

                        if (!pwdRef.current.value.trim()) {
                            alert("비밀번호를 입력하세요");
                            pwdRef.current.focus();
                            return;
                        }

                        let info = {
                            userId: idRef.current.value,
                            nickname: nickRef.current.value,
                            pwd: pwdRef.current.value,
                            email: mailRef.current.value
                        };
                        
                        fetch("http://localhost:3010/user/join", {
                            method: "POST",
                            headers: {
                                "Content-type": "application/json"
                            },
                            body: JSON.stringify(info)
                        })
                            .then(res => res.json())
                            .then(data => {
                                alert(data.message);
                                if (data.isJoin) {
                                    navigator("/");
                                }
                            })
                            .catch(err => {
                                alert("서버 에러 발생!")
                            });
                    }}>
                    회원가입
                </Button>
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                    이미 회원이라면? <Link to="/">로그인</Link>
                </Typography>
            </Box>
        </Container>
    );
}

export default Join;