const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Show a bot ping!",
    /**
     * 
     * @param {import("discord.js").ChatInputCommandInteraction} interaction 
     * @param {import("discord.js").Client} client
     */
    run: async (client, interaction) => {
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: interaction.user.globalName || interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setDescription(client.ws.ping+"ms")

        interaction.reply({ embeds: [embed] });
    }
};