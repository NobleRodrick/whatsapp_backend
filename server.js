import express from 'express';
import mongoose from 'mongoose';
import messageContent from './dbMessages.js'; // Import the model
import Pusher from 'pusher';

// App configuration
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: "1853325",
  key: "8f887f7704edee3c1d69",
  secret: "790df4d4f987db5c3aa8",
  cluster: "mt1",
  useTLS: true
});

const db = mongoose.connection;

db.once('open', () => {
  console.log('DB Connected');

  const msgCollection = db.collection('messages');
  const changeStream = msgCollection.watch();

  changeStream.on('change', (change) => {
    console.log("A change occurred", change);

    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('messages', 'inserted', 
        {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log('Error triggering Pusher');
    }
  });
});

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// MongoDB connection URI
const connection_uri = 'mongodb+srv://Alloh:pGWsSkPPBvUdbTI3@cluster0.lyyu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
(async () => {
  try {
    await mongoose.connect(connection_uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
})();

// Define a schema and model for messages
const messageSchema = new mongoose.Schema({
  name: String,
  received: Boolean,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// API Routes
app.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

app.post('/messages/new', async (req, res) => {
  try {
    const dbMessage = req.body;
    const newMessage = await Message.create(dbMessage);
    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/messages/sync', async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


