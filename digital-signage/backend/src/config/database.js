const mongoose = require('mongoose');

module.exports = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro ao conectar no MongoDB: ${error.message}`);
    process.exit(1);
  }
};
