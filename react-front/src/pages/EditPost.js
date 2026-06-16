import React, { useEffect, useRef } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    TextField,
    Card,
    CardContent
} from '@mui/material';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

function EditPost() {

    const { postId } = useParams();

    const navigate = useNavigate();

    const titleRef = useRef();
    const contentRef = useRef();
    const codeRef = useRef();
    const tagRef = useRef();
    useEffect(() => {

        fetch(`/api/post/${postId}/detail`, {
            method: "GET",
            headers: {
                "Authorization":
                    "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {

                const post = data.data.post;

                titleRef.current.value = post.TITLE;
                contentRef.current.value = post.CONTENT;
                codeRef.current.value = post.CODE_BLOCK || "";
                tagRef.current.value =
                    post.TAGS?.join(", ")
                    || "";
            });

    }, [postId]);

    function handleUpdate() {

        const title = titleRef.current.value.trim();
        const content = contentRef.current.value.trim();
        const codeBlock = codeRef.current.value.trim();

        const tags = tagRef.current?.value
            ?.split(",")
            ?.map(tag => tag.trim())
            ?.filter(tag => tag);

        fetch(
            `/api/post/${postId}`,
            {
                method: "PUT",
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
            }
        )
            .then(res => res.json())
            .then(data => {

                alert(data.message);

                if (data.result === "success") {

                    navigate("/feed");

                }

            });

    }

    return (
        <Container maxWidth="md">
            <Box py={5}>

                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: 6
                    }}
                >
                    <CardContent>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                        >
                            게시글 수정
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
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                mt: 2
                            }}
                        >

                            <Button
                                variant="contained"
                                onClick={() => {
                                    if (window.confirm("수정하시겠습니까?")) {
                                        handleUpdate();
                                    }
                                }}
                            >
                                수정
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    if (window.confirm("수정을 취소하시겠습니까?")) {
                                        navigate(-1);
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

export default EditPost;