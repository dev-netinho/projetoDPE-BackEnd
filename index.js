// index.js (Versão Final e Completa)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- LINHA ALTERADA AQUI ---
app.use(cors({
  origin: '*' // Permite acesso de QUALQUER origem
}));
// -------------------------

app.use(express.json());

// --- ROTAS DA API (CRUD COMPLETO) ---

// ROTA GET: Buscar todos os presos (READ)
app.get('/api/presos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('presos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROTA POST: Adicionar um novo preso (CREATE)
app.post('/api/presos', async (req, res) => {
    try {
        // O Supabase v2 espera um array, então colocamos o objeto dentro de []
        const { data, error } = await supabase.from('presos').insert([req.body]).select();
        if (error) throw error;
        res.status(201).json(data[0]); // Retorna o objeto criado
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROTA PUT: Atualizar um preso existente (UPDATE)
app.put('/api/presos/:id', async (req, res) => {
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

// ROTA DELETE: Deletar um preso (DELETE)
app.delete('/api/presos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('presos').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send(); // 204 No Content -> Sucesso, sem conteúdo para retornar
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});