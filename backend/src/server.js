import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { ensureSeedAdmin } from './scripts/seed.js';

dotenv.config();

const port = Number(process.env.PORT || 3000);

connectDatabase()
.then(ensureSeedAdmin)
.then(() => {
    app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
    });
})
.catch((error) => {
    console.error('Falha ao iniciar aplicação:', error);
    process.exit(1);
});
