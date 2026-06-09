const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');
const fs = require('fs');

// 서버가 켜질 때 uploads 폴더와 그 하위 profiles 폴더가 없으면 자동으로 만들어주는 안전장치
const profileUploadDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(profileUploadDir)){
    fs.mkdirSync(profileUploadDir, { recursive: true });
}
// router

const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json())

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/user", require("./routes/user"));
app.use("/post", require("./routes/post"));
app.use("/comment", require("./routes/comment"));
app.use("/profile", require("./routes/profile"));
app.use("/follow", require("./routes/follow"));

async function startServer() {
  try {
    await db.init();
    console.log('Successfully connected to Oracle database');

    app.listen(3010, () => {
      console.log('Server is running on port 3010');
    });

  } catch (err) {
    console.error('Error connecting to Oracle database. Server not started.', err);
    process.exit(1); // DB 연결 실패 시 프로세스 종료 (선택 사항)
  }
}

startServer();



