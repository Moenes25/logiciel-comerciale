const mongoose = require('mongoose');

const connectDB = async () => {
  try {
     console.log('🔄 Tentative de connexion MongoDB...');
     
    // if (!process.env.MONGODB_URI) {
    //   console.log('❌ MONGODB_URI non définie');
    //   return; // Ne pas crasher
    // }
    
    // console.log('📡 URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')); 
   await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_commerciale', {
  // await mongoose.connect('mongodb+srv://sidimedmedmoctar691_db_user:7YXo1NkaRcY6tHhP@cluster0.ytjlvpd.mongodb.net/logiciel_commercial?appName=Cluster0&retryWrites=true&w=majority', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
   });

    console.log('MongoDB connecté avec succès');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    console.log('🔄 APPLICATION CONTINUE SANS DATABASE');
    // process.exit(1);
  }
};

module.exports = connectDB;