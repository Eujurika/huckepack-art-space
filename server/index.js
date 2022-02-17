import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createWriteStream } from 'fs';
import { router as satelliteRouter } from './satellite/index.js';
const app = express();

app.use(cors());

/* const accessLogStream = createWriteStream('access.log', { flags: 'a' });
app.use(morgan('common', { immediate: true, stream: accessLogStream })); */

app.use('/satellite', satelliteRouter);

app.listen(8080, () => {
	console.log('Server is listening to http://localhost:8080');
});
