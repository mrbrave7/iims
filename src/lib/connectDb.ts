import mongoose from 'mongoose';

const MONGO_URI = process.env.mongodb_uri as string;

if (!MONGO_URI) {
  throw new Error('❌ MongoDB connection string is missing in environment variables.');
}

// Cache connection to avoid reconnecting
let cached: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null } = {
  conn: null,
  promise: null,
};

// Track connection status
let isConnected: boolean = false;

const dbConnect = async (): Promise<void> => {
  // If already connected, use existing connection
  if (isConnected && cached.conn) {
    // console.log(cached.conn)
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  // If a connection promise is already in progress, wait for it
  if (cached.promise) {
    await cached.promise;
    isConnected = mongoose.connection.readyState === 1;
    console.log('✅ Reused MongoDB connection');
    console.log('Registered Models:', mongoose.modelNames());
    return;
  }

  try {
    // Create a new connection promise
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Disable buffering for better error handling
    } as mongoose.ConnectOptions).then((mongooseInstance) => mongooseInstance.connection);

    // Wait for the connection
    cached.conn = await cached.promise;

    // Update connection status
    isConnected = cached.conn.readyState === 1;

    // Log success and registered models
    console.log('✅ MongoDB Connected Successfully');
    console.log('Registered Models:', mongoose.modelNames());
  } catch (error) {
    // Reset cached promise on failure
    cached.promise = null;
    cached.conn = null;
    isConnected = false;

    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1); // Exit process if connection fails
  }
};

// Handle connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  isConnected = false;
  cached.conn = null;
  cached.promise = null;
});

// Handle disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  isConnected = false;
  cached.conn = null;
  cached.promise = null;
});

export default dbConnect;