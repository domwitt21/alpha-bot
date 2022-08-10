const { SlashCommandBuilder, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { clientId, token } = require("./auth.json");

const commands = [
    new SlashCommandBuilder().setName("help").setDescription("Shows help embed"),
    new SlashCommandBuilder().setName("setup").setDescription("Setup your server so the bot can operate"),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log("Sucessfully registered application commands"))
    .catch(console.error);