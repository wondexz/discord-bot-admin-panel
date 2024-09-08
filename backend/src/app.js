const { Client, Partials, IntentsBitField } = require("discord.js");
const { default: chalk } = require("chalk");
const { readdirSync, writeFile, readdir, readFileSync } = require("fs");
require("dotenv").config();
const express = require('express');
const app = express();
const fs = require('fs');
const port = process.env.PORT || 80;
const { db, codedb } = require('./database/db');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const client = new Client({
    intents: Object.values(IntentsBitField.Flags),
    partials: Object.values(Partials)
});

app.use(express.json());
app.use(cors());

global.client = client;
client.commands = (global.commands = []);

readdirSync("./src/commands").forEach((category) => {
    readdirSync(`./src/commands/${category}`).forEach((file) => {
        if (!file.endsWith(".js")) return;

        const command = require(`./commands/${category}/${file}`);
        const { name, description, type, options, dm_permissions } = command;

        client.commands.push({
            name,
            description,
            type: type ? type : 1,
            options,
            dm_permissions
        });

        console.log(chalk.red("[COMMANDS]"), chalk.white(`The command named ${name} is loaded!`));
    });
});

readdirSync("./src/events").forEach((category) => {
    readdirSync(`./src/events/${category}`).forEach((file) => {
        if (!file.endsWith(".js")) return;

        const event = require(`./events/${category}/${file}`);
        const eventName = event.name || file.split(".")[0];

        client.on(eventName, (...args) => event.run(client, ...args));

        console.log(chalk.blue("[EVENTS]"), chalk.white(`Event named ${eventName} has been loaded!`));
    });
});


function botLogin() {
    client.login(db.get("token"));
}

function createApiKey() {
    db.set("apikey", uuidv4())
}

app.post('/login', (req, res) => {
    const password = req.headers["x-api-key"]
    const { username } = req.body;

    if (!username || !password) return res.json({ success: false, message: "Username ve password girilmedi." })
    if (!db.has(username)) return res.json({ success: false, message: `Geçersiz kullanıcı adı veya şifre.` })
    const data = db.get(username)
    if (password !== data.password) return res.json({ success: false, message: "Geçersiz kullanıcı adı veya şifre." })
    const code = uuidv4();

    codedb.set(code, { username: username, password: password })

    res.json({ success: true, message: "Giriş başarılı!", code: code })
});

app.post('/logout', (req, res) => {
    const code = req.headers["x-api-key"]

    if (!code) return res.json({ success: false })

    codedb.delete(code)
    res.json({ success: true, message: "Çıkış yapıldı!" })
});

app.post('/check', (req, res) => {
    const { code } = req.body;

    if (!codedb.has(code)) return res.json({ success: false })

    res.json({ success: true })
});

app.post('/bot/start', (req, res) => {
    const apikey = req.headers["x-api-key"];
    if (!apikey) return res.json({ success: false, message: "Girilmeyen queryler var." })
    if (apikey !== db.get("apikey")) return res.json({ success: false, message: "API Key yanlış girildi!" })
    if (db.has("botstarted")) return res.json({ success: false, message: "Bot zaten aktif." })

    db.set("botstarted", true)

    botLogin()

    res.json({ success: true })
});

app.post('/bot/stop', (req, res) => {
    const apikey = req.headers["x-api-key"];
    if (!apikey) return res.json({ success: false, message: "Girilmeyen queryler var." })
    if (apikey !== db.get("apikey")) return res.json({ success: false, message: "API Key yanlış girildi!" })
    db.delete("botstarted")
    client.destroy()

    res.json({ success: true })
});

app.post('/bot/status', (req, res) => {
    res.json({ active: db.get("botstarted") || false })
});

app.post('/bot/data', (req, res) => {
    const apikey = req.headers["x-api-key"]

    if (apikey !== db.get("apikey")) return res.json({ success: false })

    res.json({
        ram: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        servers: client.guilds.cache.size,
        users: client.guilds.cache.reduce((a, b) => a + b.memberCount, 0),
        ping: client.ws.ping
    })
});

app.post('/getBot', (req, res) => {
    const apikey = req.headers["x-api-key"]

    if (apikey !== db.get("apikey")) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({ token: db.get("token") || "", botstatus: db.get("botstatus") || "", botactivies: db.get("botactivies") || "", success: true })
});

app.post('/setBot', (req, res) => {
    const { token, botstatus, botactivies } = req.body;
    const apikey = req.headers["x-api-key"];

    if (!apikey || !token || !botstatus || !botactivies) return res.json({ success: false })
    if (apikey !== db.get("apikey")) return res.json({ success: false, message: "API Key yanlış girildi!" })

    if (botactivies === "online" || botactivies === "dnd" || botactivies === "idle" || botactivies === "offline") {
        db.set("token", token)
        db.set("botstatus", botstatus)
        db.set("botactivies", botactivies)
        res.json({ success: true })
    } else {
        return res.json({ success: false, message: "Yanlış girildi." })
    }
});

app.post('/console', (req, res) => {
    const { message } = req.body;
    const apikey = req.headers["x-api-key"];

    if (apikey !== db.get("apikey")) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!message || typeof message !== 'string') {
        return res.json({ message: 'Invalid message' });
    }

    exec(message, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error.message}`);
            return res.json({
                message: error.message,
                success: true
            });
        }
        if (stderr) {
            console.error(`Exec Stderr: ${stderr}`);
            return res.json({
                message: `Stderr: ${stderr}`,
                stdout: stdout,
                stderr: stderr,
                success: true
            });
        }

        res.json({
            message: stdout || stderr,
            success: true,
        });
    });
});

app.get('/auth/register', (req, res) => {
    const { apikey, username, password } = req.query;
    if (!apikey || !username || !password) return res.json({ success: false, message: "Belirtilen queryler girilmedi. username,password,apikey" })
    if (apikey !== db.get("apikey")) return res.json({ success: false, message: "API Key yanlış" })

    db.set(username, { password })
    res.json({ success: true })
});

app.listen(port, () => console.log(chalk.green("[SERVER]"), (`Server started on port ${port}`)))
if (!db.has("apikey")) {
    createApiKey()
    console.log(chalk.yellow("[SYSTEM]"), chalk.underline("API Key oluşturuldu!"))
    const apikey = db.get("apikey")
    writeFile('apikey.txt', apikey, (err) => {
        if (err) {
            console.error('Dosya yazma hatası:', err);
        }
    });
}
if (!db.has("botstarted")) return;
botLogin()
