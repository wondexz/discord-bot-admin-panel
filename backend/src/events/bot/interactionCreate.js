const { readdirSync } = require("fs");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {import("discord.js").ChatInputCommandInteraction} interaction 
     * @param {import("discord.js").Client} client
     */
    run: async (client, interaction) => {
        if (interaction.isChatInputCommand()) {
            readdirSync("./src/commands").forEach((categeory) => {
                readdirSync(`./src/commands/${categeory}`).forEach(async (file) => {
                    if (!file.endsWith(".js")) return;
                    const command = require(`../../commands/${categeory}/${file}`);
                    if (command?.dm_permissions === false) {
                        if (!interaction.guildId) return;
                    };

                    if (interaction.commandName.toLocaleLowerCase() === command?.name.toLowerCase()) {
                        return command?.run(client, interaction);
                    };
                });
            });
        };
    }
};