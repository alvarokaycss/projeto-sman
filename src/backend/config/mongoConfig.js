const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("A variável de ambiente MONGO_URI não está definida.");
        }

        await mongoose.connect(mongoUri);
        console.log('MongoDB: Conectado com sucesso via Mongoose!');
        
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectMongo;