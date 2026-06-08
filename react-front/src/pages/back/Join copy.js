import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Card,
    CardContent
} from '@mui/material';

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
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >

                <Card
                    sx={{
                        width: "100%",
                        borderRadius: 4,
                        boxShadow: 6
                    }}
                >

                    <CardContent sx={{ p: 4 }}>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            textAlign="center"
                        >
                            Code.Snippet
                        </Typography>

                        <Typography
                            textAlign="center"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            개발자를 위한 코드 기록 플랫폼
                        </Typography>

                        <TextField
                            inputRef={idRef}
                            label="ID"
                            margin="normal"
                            fullWidth
                        />

                        <TextField
                            inputRef={nickRef}
                            label="Nickname"
                            margin="normal"
                            fullWidth
                        />

                        <TextField
                            inputRef={mailRef}
                            label="Email"
                            margin="normal"
                            fullWidth
                        />

                        <TextField
                            inputRef={pwdRef}
                            label="Password"
                            type="password"
                            margin="normal"
                            fullWidth
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
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

                                const emailRegex =
                                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                                if (!email.trim()) {
                                    alert("이메일 주소를 입력하세요");
                                    mailRef.current.focus();
                                    return;
                                }

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

                                fetch(
                                    "http://localhost:3010/user/join",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-type":
                                                "application/json"
                                        },
                                        body: JSON.stringify(info)
                                    }
                                )
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

                            }}
                        >
                            회원가입
                        </Button>

                        <Typography
                            variant="body2"
                            textAlign="center"
                            sx={{ mt: 3 }}
                        >
                            이미 회원이라면?{" "}
                            <Link to="/">
                                로그인
                            </Link>
                        </Typography>

                    </CardContent>

                </Card>

            </Box>
        </Container>
    );
}

export default Join;