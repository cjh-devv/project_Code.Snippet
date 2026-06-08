import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Box
} from "@mui/material";

export default function UserCard({
    user,
    onUserClick
}) {

    const DEFAULT_AVATAR =
        "/logo512.png";

    return (
        <Card
            sx={{
                mb: 2,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)"
                }
            }}
            onClick={() =>
                onUserClick?.(user)
            }
        >
            <CardContent>
                <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                >
                    <Avatar
                        src={user.PROFILE_IMAGE || DEFAULT_AVATAR}
                        sx={{
                            width: 60,
                            height: 60
                        }}
                        imgProps={{
                            onError: (e) => {
                                e.target.src =
                                    DEFAULT_AVATAR;
                            }
                        }}
                    />

                    <Box flex={1}>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                        >
                            {user.NICKNAME}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {user.BIO ||
                                "자기소개가 없습니다."}
                        </Typography>
                    </Box>
                    {/* {user.IS_FOLLOWING ? (
                        <Typography color="primary">
                            팔로잉 중
                        </Typography>
                    ) : (
                        <Typography color="text.secondary">
                            팔로우 안함
                        </Typography>
                    )} */}
                </Box>
            </CardContent>
        </Card>
    );
}