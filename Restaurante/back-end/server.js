const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db'); // Importa o banco de dados
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://meek-elf-c2302f.netlify.app', // Substitua pelo domínio do seu Netlify
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Aumente o limite para 10MB, se necessário
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir arquivos estáticos

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 1 * 1024 * 1024 } // Limite de 1MB
});

// Middleware para lidar com erros de payload muito grandes
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'O arquivo é muito grande. O tamanho máximo permitido é 1MB.' });
        }
    } else if (err.message === 'request entity too large') {
        return res.status(413).json({ message: 'A requisição é muito grande. O tamanho máximo permitido é 1MB.' });
    }
    next(err);
});

const menuData = {
    appetizers: [
      { name: "Shimeji na Manteiga", price: "R$ 20,00", imageUrl: "https://www.nacozinhadahelo.com.br/wp-content/uploads/2022/06/receita-de-shimeji-na-manteiga.jpg" },
      { name: "Carpaccio Atum", price: "R$ 20,00", imageUrl: "https://s2.glbimg.com/KtSzWsDCAT7xLLzJnF98opbs5DA=/620x455/e.glbimg.com/og/ed/f/original/2022/04/26/receita-carpaccio-maguro-atum-cebola-molho-ponzu-daiki-sushi.jpg" }
    ],
    maincourses: [
      { name: "Uramaki Salmão", price: "R$ 20,00", imageUrl: "https://yuchendistribuidora.com.br/wp-content/uploads/2021/11/salmao.jpg"},
      { name: "Ebi Uramaki", price: "R$ 20,00", imageUrl: "https://www.padariavianney.com.br/web/image/product.template/5481/image_1024?unique=49a641d"}
    ],
    desserts: [
      { name: "Morango com nutella", price: "R$ 20,00", imageUrl: "https://www.montaencanta.com.br/wp-content/uploads/2014/09/morango-com-nutella-3.jpg"},
      { name: "Abacaxi flambado", price: "R$ 20,00", imageUrl: "https://storage.googleapis.com/imagens_videos_gou_cooking_prod/production/cooking/cropped_temp_56457449354edd25f189344.38170920_.jpg"}
    ],
    drinks: [
      { name: "Guaraná", price: "R$ 20,00", imageUrl: "https://res.cloudinary.com/vuca-solution/image/upload/w_744,h_559,c_fill,q_auto,f_auto/v1704509207/storage.vucasolution.com.br/sacadabar/arqs/produtos/b5e41x2bemfurr27gguu.jpg"},
      { name: "Sucos Naturais", price: "R$ 20,00", imageUrl: "https://www.assai.com.br/sites/default/files/blog/copos_com_sucos_de_frutas_-_suco_natural_-_assai_atacadista.jpg"}
    ],
};

const reviewsData = [];


// Endpoint para obter os dados do cardápio
app.get('/menu', (req, res) => {
    res.json(menuData);
});

// Endpoint para atualizar os dados do cardápio
app.post('/menu', (req, res) => {
    const updatedMenuData = req.body;
    console.log('Recebido dados atualizados:', updatedMenuData); // Log para verificar os dados recebidos

    menuData.appetizers = updatedMenuData.appetizers;
    menuData.maincourses = updatedMenuData.maincourses;
    menuData.desserts = updatedMenuData.desserts;
    menuData.drinks = updatedMenuData.drinks;
    res.status(200).json({ message: 'Menu atualizado com sucesso' });
});

// Endpoint para obter os reviews
app.get('/reviews', (req, res) => {
    if (req.query.username) {
        const userReviews = reviewsData.filter(review => review.username === req.query.username);
        res.json(userReviews);
    } else {
        res.json(reviewsData);
    }
});

// Endpoint para adicionar um review
app.post('/reviews', upload.single('image'), (req, res) => {
    const { title, text, rating, username } = req.body;
    const newReview = { title, text, rating, username };

    if (req.file) {
        newReview.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
        newReview.image = req.body.image;
    }

    reviewsData.push(newReview);
    res.status(201).json({ message: 'Review adicionado com sucesso' });
});

// Endpoint para editar um review
app.put('/reviews', upload.single('image'), (req, res) => {
    const { title, text, rating, username } = req.body;
    const updatedReview = { title, text, rating, username };

    if (req.file) {
        updatedReview.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
        updatedReview.image = req.body.image;
    }

    const index = reviewsData.findIndex(review => review.username === username);
    if (index !== -1) {
        reviewsData[index] = updatedReview;
        res.status(200).json({ message: 'Review editado com sucesso' });
    } else {
        res.status(404).json({ message: 'Review não encontrado' });
    }
});

// Endpoint de cadastro
app.post('/register', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    // Verifica se a senha tem pelo menos 8 dígitos
    if (password.length < 8) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 8 dígitos' });
    }

    // Verifica se as senhas coincidem
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    // Verifica se o nome de usuário já existe
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Erro no servidor' });
        }
        if (user) {
            return res.status(400).json({ message: 'Nome de usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email.includes('@sushifusion.com') ? 'Funcionario' : 'Cliente';

        db.run(`INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)`, 
        [email, username, hashedPassword, role], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ message: 'Email já cadastrado' });
                } else {
                    return res.status(500).json({ message: 'Erro no servidor' });
                }
            }
            res.status(201).json({ message: 'Cadastro realizado com sucesso', role });
        });
    });
});

// Endpoint de login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Erro no servidor' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Login inválido' });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Login inválido' });
        }
        res.status(200).json({
            message: 'Login bem-sucedido',
            user: {
                username: user.username,
                role: user.role,
                email: user.email
            }
        });
    });
});

// Endpoint para listar todos os usuários (apenas para teste)
app.get('/users', (req, res) => {
    db.all("SELECT email, username, role FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar usuários" });
        }
        res.json(rows);
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor rodando na porta 3000');
});