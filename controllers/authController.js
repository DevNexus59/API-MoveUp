import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { readUsers, writeUsers } from "../models/userModel.js";
import nodemailer from "nodemailer";
const JWT_SECRET = process.env.JWT_SECRET || "secret_fallback";
const CLIENT_ID = process.env.CLIENT_ID || "idclient_fallback";
const EMAIL_USER = process.env.EMAIL_USER || "email_fallback";
const EMAIL_PASS = process.env.EMAIL_PASS || "emailpass_fallback";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(CLIENT_ID);

export const register = async (req, res) => { const {

    name,

    firstname,

    address,

    zipcode,

    city,

    phone,

    email,

    usertype,

    levelexperiency,

    timerequired,

    diet,

    subscription,

    PaymentMethod,

    password,

} = req.body;



if (!email || !password) {

    return res.status(400).send("Email et mot de passe sont requis.");

}



try {

    const users = await readUsers();



    if (users.find((user) => user.email === email)) {

        return res.status(400).send("Cet email est déjà utilisé.");

    }



    const hashedPassword = await bcrypt.hash(password, 10);



    const newUser = {

        id: users.length ? users[users.length - 1].id + 1 : 1,

        name,

        firstname,

        address,

        zipcode,

        city,

        phone,

        email,

        password: hashedPassword,

        usertype,

        levelexperiency,

        timerequired,

        diet,

        subscription,

        PaymentMethod,

    };



    users.push(newUser);

    await writeUsers(users);



    res.status(201).send("Utilisateur créé avec succès !");

} catch (error) {

    console.error(error);

    return res.status(500).send("Erreur serveur lors de l'inscription.");

}

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    
        try {
            const users = await readUsers();
            const user = users.find((u) => u.email === email);
    
            if (!user) {
                return res.status(404).send("Email ou mot de passe incorrect.");
            }
    
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).send("Email ou mot de passe incorrect.");
            }
    
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
                expiresIn: "1h",
            });
            res.cookie("authToken", token, {
													httpOnly: true,
													secure: false, 
													sameSite: "lax",
													maxAge: 3600000,
												});
            res
                .status(200)
                .json({
                    message: "Connexion réussie !",
                    userId: user.id,
                    userFirstName: user.firstname || null,
                });
        } catch (err) {
            console.error(err);
            return res.status(500).send("Erreur serveur lors de la connexion.");
        }
    }

export const googleLogin = async (req, res) => {const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const userEmail = payload.email;
        const userName = payload.name;

        const users = await readUsers();
        let user = users.find((u) => u.email === userEmail);

        if (user) {
            console.log("Utilisateur trouvé (Connexion):", user.email);
        } else {
            console.log("Nouvel utilisateur (Inscription):", userEmail);
            const newUser = {
                id: users.length ? users[users.length - 1].id + 1 : 1,
                email: userEmail,
                name: userName,
                adresse: null,
                phone: null,
            };
            users.push(newUser);
            await writeUsers(users);
            user = newUser;
        }

        const notreToken = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" },
        );
        res.cookie("authToken", notreToken, {
									httpOnly: true,
									secure: false, //
									sameSite: "lax",
									maxAge: 3600000,
								});
        res.json({ token: notreToken
            , userId: user.id
            , userFirstName: user.firstname || null
         });
    } catch (error) {
        console.error("Échec de l'authentification Google", error);
        res.status(401).json({ error: "Authentification échouée" });
    }
}

export const forgotPassword = async (req, res) => {const { email } = req.body;
        const users = await readUsers();
        const userIndex = users.findIndex((u) => u.email === email);
        if (userIndex === -1) {
			return res.status(404).send("Utilisateur non trouvé.");
			}
        const userId = users[userIndex].id;
    
        
        const token = jwt.sign({ email: users[userIndex].email }, JWT_SECRET, {
            expiresIn: "15m",
        });
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });
        const mailOptions = {
									from: EMAIL_USER,
									to: email,
									subject: "Réinitialisation de votre mot de passe",
									html: `<p>Cliquez sur le lien pour réinitialiser votre mot de passe : <a href="http://localhost:3000/components/ResetPassword?token=${token}&userId=${userId}">Réinitialiser le mot de passe</a></p>`,
								};
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Erreur lors de l'envoi de l'email :", error);
            }
            console.log("Email envoyé :", info.response);
            res.status(200).send("Email de réinitialisation envoyé avec succès.");
        });
    }

    export const resetPassword = async (req, res) => {const { id, token, newPassword } = req.body;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const users = await readUsers();
            const userIndex = users.findIndex((u) => u.id === Number(id));
            if (userIndex === -1) {
                return res.status(404).send("Utilisateur non trouvé.");
            }
            if (users[userIndex].email !== decoded.email) {
                return res.status(401).send("Token invalide pour cet utilisateur.");
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            users[userIndex].password = hashedPassword;
            await writeUsers(users);
            res.status(200).send("Mot de passe réinitialisé avec succès.");
        } catch (error) {
            console.error(
                "Erreur lors de la réinitialisation du mot de passe :",
                error,
            );
            return res
                .status(500)
                .send("Erreur serveur lors de la réinitialisation du mot de passe.");
        }
    }

    export const getMe = async (req, res) => {
        try {
          const token = req.cookies.authToken;
          if (!token) return res.status(401).json({ message: "Non authentifié" });
      
          // On utilise le même secret pour vérifier
          const decoded = jwt.verify(token, JWT_SECRET); 
          
          // Si on arrive ici, le token est valide !
          // decoded.id contient l'ID de l'utilisateur

          const users = await readUsers();
          const user = users.find((u) => u.id === decoded.id);
          if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
          res.json({
					favoriteExercices: user.favoriteExercices,
					id: user.id,
					firstname: user.firstname || null,
					});

        } catch (error) {
          console.error("Erreur lors de la récupération de l'utilisateur :", error);
          res.status(500).json({ message: "Erreur serveur." });
        }
    }

    export const logout = (req, res) => {    
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: false, 
            sameSite: "Lax",
        });
        res.status(200).json({ message: "Déconnexion réussie." });
    }