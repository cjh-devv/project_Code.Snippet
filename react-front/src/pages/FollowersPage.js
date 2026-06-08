import { useEffect, useState } from "react";
import {
    Container,
    Typography
} from "@mui/material";

import UserCard from "../components/UserCard";

export default function FollowersPage() {

    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3010/follow/followers`, {
            headers: {
                Authorization:
                    `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setFollowers(data.list || []);
            });
    }, []);

    return (
        <Container maxWidth="sm">

            <Typography
                variant="h4"
                sx={{ mb: 3 }}
            >
                팔로워
            </Typography>

            {followers.map(user => (
                <UserCard
                    key={user.USER_ID}
                    user={user}
                />
            ))}
        </Container>
    );
}