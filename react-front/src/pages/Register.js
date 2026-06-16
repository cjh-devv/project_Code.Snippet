import React, { useRef, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    Avatar,
    IconButton,
    CardContent,
    Card,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';


function Register() {
    const [loading, setLoading] = useState(false);

    const titleRef = useRef();
    const contentRef = useRef();
    const codeRef = useRef();
    const tagRef = useRef();
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (window.confirm("등록하시겠습니까?")) { 

        const title = titleRef.current.value.trim();
        const content = contentRef.current.value.trim();
        const codeBlock = codeRef.current.value.trim();

        const tags = tagRef.current.value
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag);

        if (!title) {
            alert("제목을 입력하세요.");
            return;
        }

        if (!content) {
            alert("내용을 입력하세요.");
            return;
        }

        fetch("/api/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization":
                    "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                title,
                content,
                codeBlock,
                tags
            })
        })
            .then(res => res.json())
            .then(data => {

                alert(data.message);

                if (data.result === "success") {
                    navigate("/feed");
                }

            })
            .catch(err => {
                console.error(err);
                alert("서버 오류");
            });

    }};
    return (
        <Container maxWidth="md">
            <Box py={5}>

                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: 6
                    }}
                >
                    <CardContent sx={{ p: 4 }}>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                        >
                            게시글 작성
                        </Typography>

                        <TextField
                            inputRef={titleRef}
                            label="제목"
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            inputRef={contentRef}
                            label="설명"
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />

                        <TextField
                            inputRef={codeRef}
                            label="코드"
                            fullWidth
                            multiline
                            rows={10}
                            margin="normal"
                        />

                        <TextField
                            inputRef={tagRef}
                            label="태그 (쉼표로 구분)"
                            fullWidth
                            margin="normal"
                            placeholder="react, express, oracle"
                        />


                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                            >
                                등록
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    if (window.confirm("글쓰기를 취소하시겠습니까? 저장되지 않은 내용은 삭제됩니다")) {
                                        navigate("/feed")
                                    }
                                }}
                            >
                                취소
                            </Button>
                        </Box>

                    </CardContent>
                </Card>

            </Box>

        </Container>
    );

}


export default Register;