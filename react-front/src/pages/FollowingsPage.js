import { useEffect, useState } from "react";
import {
    Container,
    Typography
} from "@mui/material";

import UserCard from "../components/UserCard";

export default function FollowingsPage() {

    const [followings, setFollowings] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3010/follow/followings`, {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setFollowings(data.list || []);
            });
    }, []);

    return (
        <Container maxWidth="sm">

            <Typography
                variant="h4"
                sx={{ mb: 3 }}
            >
                팔로잉
            </Typography>

            {followings.map(user => (
                <UserCard
                    key={user.USER_ID}
                    user={user}
                />
            ))}
        </Container>
    );
}