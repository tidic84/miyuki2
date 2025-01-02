const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { exec } = require('child_process');
const wol = require('wakeonlan')

module.exports = {
    name: "server",
    description: "Minecraft server commands",
    category: "minecraft",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "start",
            description: "Start the minecraft server remotely",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "stop",
            description: "Stop the minecraft server remotely",
        },
    ],
    async execute(client, interaction) {
        if (interaction.options.getSubcommand() == "start") {
            await interaction.deferReply();
            exec(`nc -vz ${process.env.SERVER_IP} 25565`, (error, stdout, stderr) => {
                if (!error) {
                    interaction.editReply("The server is already running !");
                    return;
                }
            });
            
            interaction.editReply("Server started !");
            wol(process.env.SERVER_MAC).then(() => {
                console.log('wol sent!')
            })
        } else if (interaction.options.getSubcommand() == "stop") {
            await interaction.deferReply();
            let answer = true;
            exec(`nc -vz ${process.env.SERVER_IP} 25565`, (error, stdout, stderr) => {
                if (error) {
                    interaction.editReply("The server is already stopped !");
                    answer = false;
                    return;
                }
            });
            if (!answer) return;

            const guildRoleId = "1324179015086641185";
            const guildRole = interaction.guild.roles.cache.get(guildRoleId);
            if (!interaction.member.roles.cache.has(guildRoleId)) {
                interaction.editReply("You don't have the permission to do that !");
                return;
            }
        
            const serverAddress = process.env.SERVER_ID;
            const command = 'sudo shutdown now';
        
            exec(`ssh ${serverAddress} "${command}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erreur : ${error.message}`);
                    interaction.editReply(`Une erreur est survenue: veuillez contacter un administrateur`);
                    return;
                }
                if (stderr) {
                    interaction.editReply(`Une erreur est survenue: veuillez contacter un administrateur`);
                    return;
                }
                interaction.editReply("Server stopped !");
            });
        }
    },
};