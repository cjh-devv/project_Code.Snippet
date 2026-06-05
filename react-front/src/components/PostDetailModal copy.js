import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
    Chip,
    Divider,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function PostDetailModal({ open, onClose, post }) {
    console.log(post);
    if (!post) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {post?.TITLE}

                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 10,
                        top: 10
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    by {post?.USER_ID} · {new Date(post?.CREATED_AT).toLocaleString('ko-KR')}
                </Typography>

                <Typography
                    sx={{
                        mt: 2,
                        whiteSpace: 'pre-line'
                    }}
                >
                    {post?.CONTENT}
                </Typography>

                {post?.CODE_BLOCK && (
                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: '#f6f8fa',
                            borderRadius: 2,
                            fontFamily: 'monospace',
                            fontSize: 13,
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {post.CODE_BLOCK}
                    </Box>
                )}

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        mt: 2
                    }}
                >
                    {post?.TAGS?.map(tag => (
                        <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                        />
                    ))}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 4,
                        mt: 3
                    }}
                >
                    <Typography>
                        ❤️ {post?.LIKE_COUNT}
                    </Typography>

                    <Typography>
                        💬 {post?.COMMENT_COUNT}
                    </Typography>
                </Box>

            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PostDetailModal;