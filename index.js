require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authMiddleware = require('./authMiddleware'); // Importa nosso segurança

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({ origin: '*' }));
app.use(express.json());

// --- ROTAS DE AUTENTICAÇÃO (PÚBLICAS) ---

app.post('/auth/register', async (req, res) => {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, full_name }])
            .select();

        if (error) {
            if (error.code === '23505') { // Código de violação de unicidade
                return res.status(409).json({ error: 'Este email já está em uso.' });
            }
            throw error;
        }
        
        res.status(201).json({ message: 'Usuário criado com sucesso!', user: data[0] });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token expira em 8 horas
        );

        res.status(200).json({ 
            message: 'Login bem-sucedido!',
            token,
            user: { id: user.id, email: user.email, full_name: user.full_name }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- ROTAS DA API DE PRESOS (AGORA PROTEGIDAS) ---

app.get('/api/presos', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase.from('presos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/presos', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase.from('presos').insert([req.body]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/presos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('presos').update(req.body).eq('id', id).select();
        if (error) throw error;
        if (data.length === 0) return res.status(404).json({ error: 'Registro não encontrado.' });
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/presos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('presos').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});