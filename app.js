require('dotenv').config();
require('express-async-errors');
// ****** security middleware packages ******
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
// ****** security middleware packages ******
const express = require('express');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');
const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');

const app = express();
const port = process.env.PORT || 3000;

// Enable if you are behind a reverse proxy(Heroku, Bluemix, AWS ELB, Nginx, Cloudflare, Akamai, Fastly, Firebase Hosting, Rackspace LB, Riverbed Stingray, etc)
// Read docs for more info
app.set('trust proxy', 1);

// middlewares
app.use(
  rateLimiter({
    windowMs: 16 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 request per windowMs
  })
);
app.use(express.json()); // for reading req.body
app.use(helmet());
app.use(cors());
app.use(xss());
app.use('/api/v1/auth', authRouter); // routers
app.use('/api/v1/jobs', authenticateUser, jobsRouter); // routers
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
