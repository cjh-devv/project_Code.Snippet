import React, { useState } from "react";
import { Typography } from "@mui/material";
import UserProfileModal from "./UserProfileModal";

export default function UserLink({
    userId,
    nickname,
    sx = {}
}) {

    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <>
            <Typography
                sx={{
                    cursor: "pointer",
                    fontWeight: 600,
                    display: "inline-block",
                    ...sx
                }}
                onClick={() => {
                    setProfileOpen(true);
                }}
            >
                {nickname}
            </Typography>

            <UserProfileModal
                open={profileOpen}
                userId={userId}
                onClose={() => setProfileOpen(false)}
            />
        </>
    );
}