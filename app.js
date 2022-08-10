const Discord = require("discord.js");
const client = new Discord.Client({intents: ["Guilds", "GuildMessages", "MessageContent", "GuildEmojisAndStickers", "GuildMessageReactions", "GuildMembers", "GuildBans", "DirectMessages", "DirectMessageReactions", "GuildIntegrations", "GuildScheduledEvents", "GuildPresences", "GuildWebhooks", "GuildVoiceStates"]});
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ThreadManager, ThreadMember, ThreadChannel, ThreadMemberManager, WebhookClient, Webhook, ChannelType, Embed, ButtonBuilder, MessageActivityType, VoiceChannel, VoiceStateManager, AttachmentBuilder } = require("discord.js");
const config = require("./auth.json");
// const { Captcha } = require("discord.js-captcha");
const Canvas = require("@napi-rs/canvas");
const { verify } = require("crypto");

client.on("unhandledRejection", error => {
    console.error("Unhandled promise rejections", error);
});
client.on("shardError", error => {
    console.error("A websocket connection has encountered an error", error);
});
client.on("ready", () => {
    console.log("Livestream bot is ready!");
});
client.login(config.token);

const verifyBtn = new ActionRowBuilder()
    .setComponents(
        new ButtonBuilder()
            .setCustomId("1234")
            .setLabel("👉 Click me to verify")
            .setStyle(ButtonStyle.Primary)
    )
const verifyEmbed = new EmbedBuilder()
    .setColor("DarkAqua")
    .setTitle("Verification")

// CAPTCHA verification
client.on("interactionCreate", async interaction => {
    if(interaction.isChatInputCommand()) return;
    if(interaction.customId === "1234") {
        const invCode = Math.floor(Math.random() * 222437).toString();
        const filter = m => m.content.includes(invCode);
        const collector = interaction.channel.createMessageCollector({ filter });
        const canvas = Canvas.createCanvas(700, 250);
        const context = canvas.getContext("2d");
        const background = await Canvas.loadImage("./media/background.png");
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        context.strokeStyle = "#FF0000";
        context.strokeRect(0, 0, canvas.width, canvas.height);
        context.font = "60px sans-serif";
        context.fillStyle = "#ffffff";
        context.fillText(invCode, canvas.width / 2.5, canvas.height / 1.8);
        const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: 'background.png' });
        interaction.reply({ files: [attachment] });
        collector.on("collect", m => {
            if(m.member.user.id !== interaction.user.id) return;
            console.log("Got it");
            interaction.member.roles.add("814957811678707723");
            interaction.deleteReply();
            setTimeout(function messageDlt() {
                interaction.channel.bulkDelete(1);
                return;
            }, 2000);
            interaction.guild.systemChannel.send("Welcome our newest member " + m.member.user.username);
            return;
        });
    };
});

// Support ticket
const claimButton = new ActionRowBuilder()
    .setComponents(
        new ButtonBuilder()
            .setCustomId("8888")
            .setEmoji("🤝")
            .setStyle(ButtonStyle.Success)
            .setLabel("Claim")
    )
const supportButton = new ActionRowBuilder()
    .setComponents(
        new ButtonBuilder()
            .setCustomId("7777")
            .setEmoji("🎟️")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Click to open a ticket")
    )
const appealButton = new ActionRowBuilder()
    .setComponents(
        new ButtonBuilder()
            .setCustomId("6565")
            .setEmoji("👨‍⚖️")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Click to start an appeal")
    )
const ticketModal = new ModalBuilder()
    .setCustomId("4444")
    .setTitle("Ticket")
const reasonInput = new TextInputBuilder()
    .setCustomId("3333")
    .setLabel("Type your reason below...")
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(0)
    .setMaxLength(750)
const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
ticketModal.addComponents(firstActionRow);

client.on("messageCreate", message => {
    if(message.content === "ban") {
        message.channel.send({components: [appealButton]});
    }
})
//Updates button when ticket is claimed
client.on("interactionCreate", async interaction => {
    if(interaction.isChatInputCommand()) return;
    if(interaction.type === InteractionType.ModalSubmit) return;
    const filter = i => i.customId === "8888";
    const collector = interaction.channel.createMessageComponentCollector({ filter });
    collector.on("collect", async i => {
        const claimedButton = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setCustomId("8954")
                    .setEmoji("🤝")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Claimed by: " + i.user.username)
                    .setDisabled(true)
            )
        await i.update({ components: [claimedButton] });
        return;
    });
    if(interaction.customId === "7777") {
        await interaction.showModal(ticketModal);
        return;
    } else { 
        return;
    }
});
client.on("interactionCreate", async interaction => {
    if(!InteractionType.ModalSubmit) return;
    if(interaction.type === InteractionType.ModalSubmit) {
        if(interaction.channel.id === "814965027676487791") {
            await interaction.reply("Your ticket has been submitted and Admins have been notified! You will be notified when someone claims your ticket!");
            setTimeout(function timing() {
                interaction.deleteReply();
            }, 4000);
            const response = interaction.fields.getTextInputValue("3333");
            const ticketNumber = Math.ceil(Math.random() * 10000);
            const ticketDate = new Date();
            const ticketEmbed = new EmbedBuilder()
                .setColor("DarkRed")
                .setTitle("**Support Ticket**")
                .addFields([
                    {name: "Username", value: `${interaction.user.username}`},
                    {name: "Discord ID", value: `${interaction.user.id}`},
                    {name: "Date Opened", value: `${ticketDate.toDateString()} ${ticketDate.toLocaleTimeString()}`},
                    {name: "Ticket #", value: `${ticketNumber}`},
                    {name: "Reason", value: `${response}`},
                ])
            const ticketLog = interaction.guild.channels.cache.find(c => c.id === "1000480141304156250").send({embeds: [ticketEmbed], components: [claimButton]});
            return;
        }
    };
});

//ban appeal
client.on("interactionCreate", async interaction => {
    // if(interaction.type === InteractionType.ModalSubmit) return;
    if(interaction.customId === "6565") {
        const appealModal = new ModalBuilder()
            .setCustomId("7894")
            .setTitle("Ticket")
        const reasonInput = new TextInputBuilder()
            .setCustomId("9087")
            .setLabel("Type your reason below...")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(0)
            .setMaxLength(750)
        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
        appealModal.addComponents(firstActionRow);
        await interaction.showModal(appealModal);
        return;
    } else if(interaction.type === InteractionType.ModalSubmit) {
        if(interaction.channel.id === "999656118626291824") {
            const appealLog = interaction.guild.channels.cache.find(c => c.id === "1005284489930477578");
            interaction.reply("Your ban appeal has been successfully submitted");
            setTimeout(function timingMain() {
                interaction.deleteReply();
            }, 4000);
            const response = interaction.fields.getTextInputValue("9087");
            const appealEmbed = new EmbedBuilder()
                .setColor("DarkGold")
                .setTitle("Ban Appeal")
                .addFields([
                    {name: "Username", value: `${interaction.user.username}`},
                    {name: "Reason", value: `${response}`},
                ])
            appealLog.send({embeds: [appealEmbed], components: [claimButton]});
            return;
        };
    };
});

//reaction roles
const reactionEmbed = new EmbedBuilder()
    .setColor("DarkRed")
    .setTitle("Reaction Roles")
    .setDescription("React below to get the role you want!")
    .addFields([
        {name: "Squad Player", value: "<:squadEmoji:1006713644127637554>"},
        {name: "USEC", value: "<:usecEmoji:1006713645843095722>"},
        {name: "BEAR", value: "<:bearLogo:1006713627920826520>"},
        {name: "DCS Player", value: "<:dcsEmoji:1006713633448927302>"},
        {name: "Fortnite", value: "<:fortniteEmoji:1006713635114070057>"},
        {name: "COD Player", value: "<:codEmoji:1006713631729274901>"},
        {name: "Ground Branch Player", value: "<:groundBranchEmoji:1006713636766621748>"},
        {name: "Ready or Not Player", value: "<:readyOrNotEmoji:1006713638968631457>"},
    ])

client.on("messageCreate", async message => {
    if(message.content === "working") {
        const sendEmbed = (await message.channel.send({embeds: [reactionEmbed], fetchReply: true}));
        sendEmbed.react("<:squadEmoji:1006713644127637554>");
        sendEmbed.react("<:usecEmoji:1006713645843095722>");
        sendEmbed.react("<:bearLogo:1006713627920826520>");
        sendEmbed.react("<:dcsEmoji:1006713633448927302>");
        sendEmbed.react("<:fortniteEmoji:1006713635114070057>");
        sendEmbed.react("<:codEmoji:1006713631729274901>");
        sendEmbed.react("<:groundBranchEmoji:1006713636766621748>");
        sendEmbed.react("<:readyOrNotEmoji:1006713638968631457>");
        return;
    } else {
        return;
    };
});

client.on("messageReactionAdd", (reaction, user) => {
    if(user.bot) return;
    if(reaction.emoji.name === "squadEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185175565664286");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("816185175565664286");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "usecEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185218905931797");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("816185218905931797");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "bearLogo") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "1006730297729093673");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("1006730297729093673");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "dcsEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185289751789588");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("816185289751789588");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "fortniteEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185397968896002");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("816185397968896002");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "codEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185446832537621");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("816185446832537621");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "groundBranchEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "1006730394617516043");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("1006730394617516043");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "readyOrNotEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "1006730270218666034");
        if(findRole == undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.add("1006730270218666034");
        } else {
            return;
        };
    } else {
        return;
    };
});

client.on("messageReactionRemove", (reaction, user) => {
    if(user.bot) return;
    if(reaction.emoji.name === "squadEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185175565664286");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("816185175565664286");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "usecEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185218905931797");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("816185218905931797");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "bearLogo") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "1006730297729093673");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("1006730297729093673");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "dcsEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185289751789588");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("816185289751789588");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "fortniteEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185397968896002");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("816185397968896002");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "codEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "816185446832537621");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("816185446832537621");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "groundBranchEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "1006730394617516043");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("1006730394617516043");
        } else {
            return;
        };
    } else if(reaction.emoji.name === "readyOrNotEmoji") {
        const findRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.cache.find(r => r.id === "1006730270218666034");
        if(findRole !== undefined) {
            //add role to user
            const addRole = client.guilds.cache.find(g => g.id === "714711330212282398").members.cache.find(u => u.id === user.id).roles.remove("1006730270218666034");
        } else {
            return;
        };
    } else {
        return;
    };
});