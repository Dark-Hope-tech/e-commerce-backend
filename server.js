import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import foodRouter from './src/routers/food.router.js';
import userRouter from './src/routers/user.router.js';
import orderRouter from './src/routers/order.router.js';
import uploadRouter from './src/routers/upload.router.js';

import { dbconnect } from './src/config/database.config.js';
import path, { dirname } from 'path';
dbconnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
// app.use(
//   cors({
//     credentials: true,
//     origin: ['http://localhost:3000'],
//   })
// );
app.use(cors());
app.use('/api',(req,res)=>{
  res.send('server is running');
});
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);

// const publicFolder = path.join(__dirname, 'public');
// app.use(express.static(publicFolder));

// app.get('*', (req, res) => {
//   const indexFilePath = path.join(publicFolder, 'index.html');
//   res.sendFile(indexFilePath);
// });

const PORT = 3001;
app.listen(PORT, () => {
  console.log('listening on port ' + PORT);
});
