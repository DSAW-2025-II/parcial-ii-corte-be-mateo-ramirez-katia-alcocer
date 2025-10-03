require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const app = express();

app.use(express.json());

//cors
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//login
app.post('/api/v1/auth', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@admin.com' && password === 'admin') {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });
    return res.status(200).json({ token });
  } else {
    return res.status(400).json({ error: 'invalid credentials' });
  }
});


// validar token
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(403).json({ error: "User not authenticated" });
  const token = auth.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "User not authenticated" });
  }
}

//api
app.post('/api/v1/pokemonDetails', authMiddleware, async (req, res) => {
    const { pokemonName } = req.body;
    try {
        const pokeRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        const data = pokeRes.data;
        return res.status(200).json({
            name: data.name || "",
            species: data.species.name || "",
            weight: data.weight || "",
            img_url: data.sprites.front_default || ""
        });
    } catch (err) {
        return res.status(400).json({
            name: "",
            species: "",
            weight: "",
            img_url: ""
        });
    }
});
app.get('/', (req, res) => {
  res.send('¡API Parcial Web funcionando correctamente!');
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor backend en puerto ${PORT}`));