const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
    =============================================
    🚀 Server running in ${process.env.NODE_ENV} mode
    🔗 Port: ${PORT}
    📅 Started: ${new Date().toISOString()}
    =============================================
  `);
});

// Handle unhandled promise rejections (log but don't crash)
process.on('unhandledRejection', (reason, promise) => {
  console.error(`⚠️  Unhandled Rejection at:`, promise);
  console.error(`⚠️  Reason:`, reason);
  if (reason && reason.stack) {
    console.error(reason.stack);
  }
  // Log but continue running - the request already has error handling
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  
  // In production, you might want to restart the process
  // For now, we'll log and attempt to continue
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      console.log('Server closed due to uncaught exception');
      process.exit(1);
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});