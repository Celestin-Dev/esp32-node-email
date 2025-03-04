require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const PORT = process.env.PORT;

// Transporter sécurisé (utiliser des variables d'environnement)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, 
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Connexion MySQL avec pool de connexions
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "temp_hum_db"
});

// Route pour insérer des données et envoyer un email
app.post('/temperature-humidite', async (req, res) => {
  const { humidity, temperature } = req.body;
  if (!humidity || !temperature) {
    return res.status(400).json({ error: "Données invalides" });
  }

  const sql = "INSERT INTO temp_humidy_table (humidity, temperature) VALUES (?, ?)";

  pool.query(sql, [humidity, temperature], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur lors de l'insertion" });
    }

    // Préparation de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'nomenjanaharycelestin33@gmail.com',
      subject: 'Humidité et Température',
      text: `Humidité: ${humidity}, Température: ${temperature}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Erreur d'envoi d'email :", error);
      } else {
        console.log('Email envoyé: ' + info.response);
      }
    });

    res.json({ message: "Données insérées avec succès" });
  });
});

// Route pour récupérer les données
app.get('/temperature-humidite/', (req, res) => {
  const sql = "SELECT humidity, temperature FROM temp_humidy_table";
  
  pool.query(sql, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur de récupération" });
    }
    res.json(results);
  });
});

// Écoute sur le port défini
app.listen(PORT, () => console.log(`Serveur en cours d'exécution sur le port ${PORT}`));
