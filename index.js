const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionsBitField,
  AuditLogEvent,
  ActivityType
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});
// ...existing code...
// ...existing code...
/**
 * Log embed oluşturur
 * Hem eski (title, description) hem de yeni ({ title, fields, ... }) parametrelerle çalışır
 * @param {string|object} arg1
 * @param {string} [arg2]
 * @returns {EmbedBuilder}
 */
function createLogEmbed(arg1, arg2) {
  const embed = new EmbedBuilder().setColor(EMBED_COLOR).setFooter({ text: "Ada 💞 Kerem Bot" }).setTimestamp();
  if (typeof arg1 === "string") {
    embed.setTitle(arg1);
    if (arg2) embed.setDescription(arg2);
  } else if (typeof arg1 === "object" && arg1 !== null) {
    if (arg1.emoji && arg1.title) embed.setTitle(`${arg1.emoji} ${arg1.title}`);
    else if (arg1.title) embed.setTitle(arg1.title);
    if (arg1.description) embed.setDescription(arg1.description);
    if (arg1.executorTag) embed.addFields({ name: "İşlemi Yapan", value: arg1.executorTag, inline: false });
    if (arg1.fields && Array.isArray(arg1.fields)) embed.addFields(...arg1.fields);
    if (arg1.executorAvatar) embed.setThumbnail(arg1.executorAvatar);
    if (arg1.image) embed.setImage(arg1.image);
    if (arg1.thumbnail) embed.setThumbnail(arg1.thumbnail);
  }
  return embed;
}
/**
 * Anonim confess mesajı için embed oluşturur
 * @param {string} text
 * @returns {EmbedBuilder}
 */
function createConfessEmbed(text) {
  return new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle("Anonim Mesaj")
    .setDescription(text)
    .setFooter({ text: "Ada 💞 Kerem Bot" })
    .setTimestamp();
}

/**
 * Mention, ID veya username ile kullanıcıyı bulur
 * @param {Client} client
 * @param {string} input
 * @param {User} fallbackUser
 * @returns {Promise<User|null>}
 */
async function resolveUserFromInput(client, input, fallbackUser) {
  if (!input) return fallbackUser || null;
  // Mention ise
  const mentionMatch = input.match(/^<@!?([0-9]+)>$/);
  let userId = input;
  if (mentionMatch) {
    userId = mentionMatch[1];
  }
  // ID ise
  if (/^[0-9]{5,}$/.test(userId)) {
    try {
      return await client.users.fetch(userId);
    } catch {
      return null;
    }
  }
  // Username ise
  const users = client.users.cache.filter(u => u.username === input || u.tag === input);
  if (users.size > 0) return users.first();
  return null;
}
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

function loadConfig() {
  const configPath = path.join(__dirname, "config.json");

  if (!fs.existsSync(configPath)) {
    console.warn("config.json bulunamadi, varsayilan ayarlar kullaniliyor.");
    return {};
  }

  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn("config.json okunamadi, varsayilan ayarlar kullaniliyor:", error.message);
    return {};
  }
}

const config = loadConfig();

// ...existing code...

const EMBED_COLOR = 0xF8BBD0;

const prefix = process.env.PREFIX || ".";
const enableMemberJoinEvent = process.env.ENABLE_MEMBER_JOIN_EVENT === "true";
const enablePrefixCommands = process.env.ENABLE_PREFIX_COMMANDS === "true";
const reactionRolesEnabled = process.env.ENABLE_REACTION_ROLES === "true";
const token = process.env.TOKEN;
const configuredLogChannelId = config.logChannelId;
const memberRoleId = config.memberRoleId;
const PINK_HEART = "💖";
const LIGHT_BLUE_HEART = "💙";
const MAX_DELETED_MESSAGE_CACHE_SIZE = 100;
const DELETE_EVENT_DEDUPE_MS = 5000;
const deletedMessageCache = new Map();
const recentDeleteEventIds = new Map();
const GUARD_COLOR = 0xFF80AB;

/**
 * Log kanalını döndürür. config.json'daki logChannelId'yi kullanır ve yetki kontrolü yapar.
 * @param {Guild} guild
 * @returns {Promise<TextChannel|null>}
 */
async function getLogChannel(guild) {
  if (!guild || !configuredLogChannelId) return null;
  try {
    const channel = guild.channels.cache.get(configuredLogChannelId) || await guild.channels.fetch(configuredLogChannelId).catch(() => null);
    if (!channel) return null;
    // Kanalın yazma yetkisi olup olmadığını kontrol et
    const botMember = guild.members.me || await guild.members.fetch(client.user.id);
    if (!channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)) return null;
    return channel;
  } catch {
    return null;
  }
}
function createHelpEmbed() {
  return new EmbedBuilder()
    .setColor(0xF8BBD0)
    .setTitle("<:ada:1483438536765210664> Yardım Menüsü")
    .setDescription("Botta bulunan komutlar aşağıda yazıyor")
    .addFields(
      {
        name: "Prefix Komutlar",
        value: [
          ".avatar [@kullanıcı / ID]",
          ".banner [@kullanıcı / ID]",
          ".ban [@kullanıcı / ID] [sebep]",
          ".kick [@kullanıcı / ID] [sebep]",
          ".unban [ID]",
          ".emoji",
          ".confess [@kullanıcı / ID] [mesaj]",
          ".wl-ekle [ID]",
          ".wl-sil [ID]",
          ".wl-liste",
          ".nuke",
          ".yardım"
        ].join("\n"),
        inline: false
      },
      {
        name: "Slash Komutlar",
        value: [
          "/banner",
          "/confess",
          "/gif",
          "/userinfo",
          "/yardım"
        ].join("\n"),
        inline: false
      }
    )
    .setFooter({ text: "Ada 💞 Kerem Bot" })
    .setTimestamp();
}

function guvenliMi(userId, guild) {
  if (!userId) return false;

  const ownerIds = Array.isArray(config.ownerIds) ? config.ownerIds : [];
  const whitelist = Array.isArray(config.whitelist) ? config.whitelist : [];

  if (ownerIds.includes(userId)) return true;
  if (whitelist.includes(userId)) return true;
  if (guild?.ownerId === userId) return true;
  if (client.user?.id === userId) return true;
  return false;
}

async function sendLog(guild, embed) {
  try {
    const isActivityLog = embed?.data?.fields?.some(
      (field) => field?.name === "İşlem Türü" && /aktivite/i.test(field?.value || "")
    );
    if (isActivityLog) return;

    const channel = await getLogChannel(guild);
    if (!channel) {
      console.log("Log kanalı bulunamadı");
      return;
    }

    if (channel.id !== configuredLogChannelId) {
      console.warn(`[LOG] Guvenlik engeli: hedef kanal ID uyusmuyor (${channel.id})`);
      return;
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Log gönderme hatası:", error);
  }
}

async function sendGuardLog(guild, {
  emoji = "<:ada:1483438536765210664>",
  title = "Guard Bildirimi",
  executor = null,
  fields = []
}) {
  try {
    const channel = await getLogChannel(guild);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(GUARD_COLOR)
      .setTitle(`${emoji} ${title}`)
      .setTimestamp()
      .setFooter({ text: "Guard Sistemi" });

    if (executor) {
      embed.setThumbnail(executor.displayAvatarURL({ dynamic: true }));
      embed.addFields({
        name: "İşlemi Yapan",
        value: `${executor.tag} (${executor.id})`,
        inline: false
      });
    }

    if (fields.length > 0) {
      embed.addFields(fields);
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Guard log hatası:", error);
  }
}

async function getAuditExecutor(guild, type, targetId) {
  try {
    const logs = await guild.fetchAuditLogs({
      type,
      limit: 1
    });

    const entry = logs.entries.first();
    if (!entry) return null;

    if (targetId && entry.target?.id !== targetId) return null;
    if (Date.now() - entry.createdTimestamp > 5000) return null;

    return entry;
  } catch (error) {
    return null;
  }
}

async function getMessageDeleteAuditExecutor(guild, deletedAuthorId, channelId) {
  try {
    const logs = await guild.fetchAuditLogs({
      type: AuditLogEvent.MessageDelete,
      limit: 6
    });

    const now = Date.now();
    let bestEntry = null;
    let bestScore = 0;

    for (const entry of logs.entries.values()) {
      if (now - entry.createdTimestamp > 15000) continue;

      let score = 1;
      if (deletedAuthorId && entry.target?.id === deletedAuthorId) score += 2;
      if (channelId && entry.extra?.channel?.id === channelId) score += 1;

      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    if (bestScore < 2) return null;
    return bestEntry;
  } catch {
    return null;
  }
}

function rememberMessageForDeleteLog(message) {
  if (!message?.id) return;

  const textContent = typeof message.content === "string" && message.content.length
    ? message.content
    : (typeof message.cleanContent === "string" && message.cleanContent.length ? message.cleanContent : null);

  const attachmentUrls = message.attachments?.size
    ? message.attachments.map((file) => file.url).join("\n")
    : null;

  const content = textContent || attachmentUrls || null;

  const channelLabel = message.channel
    ? `${message.channel}`
    : (message.channelId ? `<#${message.channelId}>` : null);

  const attachments = message.attachments?.size
    ? message.attachments.map((file) => file.url)
    : [];

  const contentWithAttachments = attachments.length && content
    ? `${content}\n${attachments.join("\n")}`
    : (content || attachments.join("\n") || null);

  deletedMessageCache.set(message.id, {
    authorId: message.author?.id || null,
    authorTag: message.author?.tag || null,
    isBot: Boolean(message.author?.bot),
    content: contentWithAttachments,
    channelId: message.channelId || null,
    channelLabel
  });

  if (deletedMessageCache.size > MAX_DELETED_MESSAGE_CACHE_SIZE) {
    const oldestKey = deletedMessageCache.keys().next().value;
    if (oldestKey) deletedMessageCache.delete(oldestKey);
  }
}

function rememberRawMessageForDeleteLog(packet) {
  const data = packet?.d;
  if (!data?.id || !data.guild_id) return;
  if (data.author?.bot) return;

  const rawContent = typeof data.content === "string" && data.content.length
    ? data.content
    : null;

  const rawAttachments = Array.isArray(data.attachments)
    ? data.attachments
      .map((file) => file?.url)
      .filter(Boolean)
    : [];

  const content = rawAttachments.length && rawContent
    ? `${rawContent}\n${rawAttachments.join("\n")}`
    : (rawContent || rawAttachments.join("\n") || null);

  const discriminator = data.author?.discriminator;
  const authorTag = discriminator && discriminator !== "0"
    ? `${data.author.username}#${discriminator}`
    : (data.author?.global_name || data.author?.username || null);

  deletedMessageCache.set(data.id, {
    authorId: data.author?.id || null,
    authorTag,
    isBot: false,
    content,
    channelId: data.channel_id || null,
    channelLabel: data.channel_id ? `<#${data.channel_id}>` : null
  });

  if (deletedMessageCache.size > MAX_DELETED_MESSAGE_CACHE_SIZE) {
    const oldestKey = deletedMessageCache.keys().next().value;
    if (oldestKey) deletedMessageCache.delete(oldestKey);
  }
}

function truncateField(text, maxLength = 1024) {
  const value = text || "Yok";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

async function upsertAvatarSlashCommand() {
  if (!client.application) return;

  const commandData = new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Kullanıcının avatarını gösterir")
    .addUserOption((option) =>
      option
        .setName("kullanici")
        .setDescription("Avatarı gösterilecek kullanıcı")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Kullanıcı ID")
        .setRequired(false)
    )
    .toJSON();

  const commands = await client.application.commands.fetch();
  const existing = commands.find((cmd) => cmd.name === "avatar");

  if (existing) {
    await existing.edit(commandData);
  } else {
    await client.application.commands.create(commandData);
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`${client.user.tag} aktif`);

  client.user.setPresence({
    activities: [
      {
        name: "Ada 💞 Kerem /tavsik",
        type: ActivityType.Listening
      }
    ],
    status: "online"
  });

  for (const guild of client.guilds.cache.values()) {
    const logChannel = await getLogChannel(guild);
    if (logChannel) {
      console.log(`[LOG] ${guild.name}: #${logChannel.name || logChannel.id} aktif`);
    } else {
      console.warn(`[LOG] ${guild.name}: log pasif. Ayarli log kanali bulunamadi veya yetki yok.`);
    }
  }

  try {
    await upsertAvatarSlashCommand();
    console.log("/avatar slash komutu hazır.");
  } catch (error) {
    console.error("Slash komut kayit hatasi:", error);
  }
});

client.on(Events.MessageCreate, (message) => {
  rememberMessageForDeleteLog(message);
});

client.on(Events.Raw, (packet) => {
  if (packet.t !== "MESSAGE_CREATE") return;
  rememberRawMessageForDeleteLog(packet);
});

if (enableMemberJoinEvent) {
  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      if (!memberRoleId) return;
      await member.roles.add(memberRoleId);
      console.log(`Otorol verildi: ${member.user.tag}`);
    } catch (error) {
      console.error("Otorol hatasi:", error.message);
    }
  });
}

if (enablePrefixCommands) {
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    // .nuke komutu
    if (command === "nuke") {
      if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("Bu komutu kullanmak için kanal yönetme yetkisine sahip olmalısın.");
      }
      const channel = message.channel;
      const position = channel.position;
      const parent = channel.parent;
      const newChannel = await channel.clone({ reason: ".nuke komutu kullanıldı" });
      await newChannel.setPosition(position);
      if (parent) await newChannel.setParent(parent.id);
      await channel.delete(".nuke komutu ile silindi");
      await newChannel.send("Kanal başarıyla yenilendi! :boom:");
      return;
    }
    if (command === "yardım" || command === "help") {
      const embed = createHelpEmbed();
      return message.reply({ embeds: [embed] });
    }

    if (command === "ping") {
      try {
        await message.reply("Pong");
      } catch (error) {
        console.error("Ping cevabi gonderilemedi:", error.message);
      }
    }

    if (command === "avatar") {
      let user;
      if (message.mentions.users.first()) {
        user = message.mentions.users.first();
      } else if (args[0]) {
        try {
          user = await client.users.fetch(args[0]);
        } catch {
          const embed = createLogEmbed({
            title: "Bir hata meydana geldi.",
            description: "Böyle bir kullanıcı bulunamadı."
          });
          return message.reply({ embeds: [embed] });
        }
      } else {
        user = message.author;
      }
      const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
      const embed = createLogEmbed({
        title: "Avatar",
        description: `${user} kullanıcısının avatarı`,
        image: avatar,
        thumbnail: user.displayAvatarURL({ dynamic: true })
      });
      embed.setURL(avatar);
      await message.reply({ embeds: [embed] });
    }

    if (command === "ban") {
      if (!message.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply("Bu komutu kullanmak için gereken yetkiye sahip değilsin.");
      }
      let user = message.mentions.members.first();
      const userId = args[0];
      if (!user && userId) {
        user = await message.guild.members.fetch(userId).catch(() => null);
      }
      if (!user && !userId) {
        return message.reply("Bu komutu kullanmak için birini etiketlemeli ya da ID'sini girmelisin.");
      }
      if (user && user.id === message.author.id) {
        return message.reply("Kendini banlayamazsın.");
      }
      if (user && user.id === message.guild.ownerId) {
        return message.reply("Sunucu sahibine dokunamazsın.");
      }
      if (!user && userId === message.author.id) {
        return message.reply("Kendini banlayamazsın.");
      }
      if (!user && userId === message.guild.ownerId) {
        return message.reply("Sunucu sahibine dokunamazsın.");
      }
      if (user && !user.bannable) {
        return message.reply("Bu kullanıcıyı banlayamam.");
      }
      const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";
      try {
        if (user) {
          await user.ban({ reason });
          message.channel.send(`${user.user.tag} kişisi başarıyla sunucudan yasaklandı.\nSebep: ${reason}`);
        } else {
          await message.guild.members.ban(userId, { reason });
          message.channel.send(`${userId} ID'li kullanıcı başarıyla sunucudan yasaklandı.\nSebep: ${reason}`);
        }
      } catch (err) {
        console.error(err);
        const embed = createLogEmbed({ title: "Ban Hatası", description: "Kişi yasaklanırken bir hata meydana geldi." });
        message.channel.send({ embeds: [embed] });
      }
    }

    if (command === "kick") {
      if (!message.member?.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return message.reply("Bu komutu kullanmak için gereken yetkiye sahip değilsin.");
      }
      let user = message.mentions.members.first();
      const userId = args[0];
      if (!user && !userId) {
        return message.reply("Bu komutu kullanmak için birini etiketlemeli ya da ID'sini girmelisin.");
      }
      if (!user && userId) {
        try {
          user = await message.guild.members.fetch(userId);
        } catch {
          return message.reply("Bu kullanıcı sunucuda değil.");
        }
      }
      if (user.id === message.author.id) {
        return message.reply("Kendini kickleyemezsin.");
      }
      if (user.id === message.guild.ownerId) {
        return message.reply("Sunucu sahibine dokunamazsın.");
      }
      if (!user.kickable) {
        return message.reply("Bu kullanıcıyı atamam.");
      }
      const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";
      try {
        await user.kick(reason);
        message.channel.send(` ${user.user.tag} kişisi başarıyla sunucudan atıldı.\nSebep: ${reason}`);
      } catch (err) {
        console.error(err);
        const embed = createLogEmbed({ title: "Kick Hatası", description: "Kişi atılırken bir hata meydana geldi." });
        message.channel.send({ embeds: [embed] });
      }
    }

    if (command === "wl-ekle") {
      if (!Array.isArray(config.ownerIds) || !config.ownerIds.includes(message.author.id)) {
        return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
      }

      const id = args[0]?.replace(/[<@!>]/g, "");
      if (!id) return message.reply("Bu komutu kullanmak için bir ID girmelisin.");

      if (!Array.isArray(config.whitelist)) {
        config.whitelist = [];
      }

      if (config.whitelist.includes(id)) {
        return message.reply("Bu kullanıcı zaten whitelist'te.");
      }

      config.whitelist.push(id);
      fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

      return message.channel.send(`${id} kullanıcısı whitelist'e eklendi.`);
    }

    if (command === "wl-sil") {
      if (!Array.isArray(config.ownerIds) || !config.ownerIds.includes(message.author.id)) {
        return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
      }

      const id = args[0]?.replace(/[<@!>]/g, "");
      if (!id) return message.reply("Bu komutu kullanmak için bir ID girmelisin.");

      if (!Array.isArray(config.whitelist) || !config.whitelist.includes(id)) {
        return message.reply("Bu kullanıcı whitelist'te değil.");
      }

      config.whitelist = config.whitelist.filter(x => x !== id);
      fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

      return message.channel.send(`${id} kullanıcısı whitelist'ten çıkarıldı.`);
    }

    if (command === "wl-liste") {
      if (!Array.isArray(config.ownerIds) || !config.ownerIds.includes(message.author.id)) {
        return message.reply("Bu komutu sadece bot sahibi kullanabilir.");
      }

      if (!Array.isArray(config.whitelist) || !config.whitelist.length) {
        return message.channel.send("Whitelist boş.");
      }

      return message.channel.send(`Whitelist:\n${config.whitelist.join("\n")}`);
    }

    if (command === "unban") {
      if (!message.member?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply("Bu komutu kullanmak için gereken yetkiye sahip değilsin.");
      }

      const userId = args[0];
      if (!userId) return message.reply("Bu komutu kullanmak için bir ID girmelisin.");

      try {
        const bannedUsers = await message.guild.bans.fetch();

        if (!bannedUsers.has(userId)) {
          return message.reply("Bu kullanıcı yasaklı değil.");
        }

        await message.guild.members.unban(userId);

        message.channel.send(`${userId} ID'li kullanıcının yasağı başarıyla kaldırıldı.`);
      } catch (err) {
        console.error(err);
        message.channel.send("Kullanıcının yasağı açılırken bir hata meydana geldi.");
      }
    }

    if (command === "emoji") {
      if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
        return message.reply("Bu komutu kullanmak için gereken yetkiye sahip değilsin.");
      }

      const customEmojiRegex = /<(a?):([a-zA-Z0-9]+):(\d+)>/g;
      const matches = [...message.content.matchAll(customEmojiRegex)];

      if (!matches.length) {
        return message.reply("Mesaja bir emoji eklemelisin. Örn: .emoji ask :emoji:");
      }

      let added = 0;
      let failed = 0;
      const results = [];

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const animated = match[1] === "a";
        const originalName = match[2];
        const emojiId = match[3];

        let newName = args[i];

        if (!newName || newName.toLowerCase() === "emoji") {
          newName = originalName;
        }

        newName = newName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        if (!newName) newName = `emoji${Date.now()}${i}`;

        const extension = animated ? "gif" : "png";
        const url = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}?size=96&quality=lossless`;

        try {
          const emoji = await message.guild.emojis.create({
            attachment: url,
            name: newName
          });

          results.push(animated
            ? `eklendi: <a:${emoji.name}:${emoji.id}>`
            : `eklendi: <:${emoji.name}:${emoji.id}>`
          );

          added++;
        } catch (error) {
          failed++;
          console.error(`Emoji eklenemedi (${originalName}):`, error);
          results.push(`${originalName} eklenirken bir hata oluştu.`);
        }
      }

      if (results.length) {
        await message.channel.send(results.join("\n").slice(0, 1900));
      }

      if (failed > 0) {
        await message.channel.send(`${failed} tane emoji eklenirken bir hata meydana geldi.`);
      }
    }

    if (command === "banner") {
      const rawInput = args[0];

      let user = message.mentions.users.first();

      if (!user) {
        user = await resolveUserFromInput(client, rawInput, message.author);
      }

      if (!user) {
        return message.reply("Böyle bir kullanıcı bulunamadı.");
      }

      const banner = await getUserBanner(user);

      if (!banner) {
        return message.reply("Bu kullanıcının bannerı yok.");
      }

      const embed = createLogEmbed({
        title: "Banner",
        description: `${user.tag} kullanıcısının bannerı`,
        image: banner,
        thumbnail: user.displayAvatarURL({ dynamic: true, size: 1024 })
      });
      return message.reply({ embeds: [embed] });
    }

    if (command === "confess") {
      // Prefix confess komutu için args ve message kullanımı
      const rawTarget = args[0];
      const text = args.slice(1).join(" ").trim();

      if (!rawTarget) {
        return message.reply("Bir kullanıcı etiketlemeli veya ID girmelisin.");
      }

      const target = await resolveUserFromInput(client, rawTarget, message.author);

      if (!target) {
        return message.reply("Böyle bir kullanıcı bulunamadı.");
      }

      if (target.id === message.author.id) {
        return message.reply("Kendine mesaj atamazsın.");
      }

      if (!text) {
        return message.reply("Bir mesaj yazmalısın.");
      }

      const embed = createConfessEmbed(text);
      try {
        await target.send({ embeds: [embed] });
        return message.reply("Mesaj gönderildi.");
      } catch (error) {
        console.error("Prefix confess hatası:", error);
        return message.reply("Bu kullanıcının DM'i kapalı veya ortak sunucu yok.");
      }
    }
  });
}

if (reactionRolesEnabled) {
  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
      if (user.bot) return;
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.message.id !== config.reactionRoleMessageId) return;

      const member = await reaction.message.guild.members.fetch(user.id);
      const emoji = reaction.emoji.name;

      if (emoji === PINK_HEART) {
        if (member.roles.cache.has(config.boyRoleId)) {
          await member.roles.remove(config.boyRoleId);
        }
        if (!member.roles.cache.has(config.girlRoleId)) {
          await member.roles.add(config.girlRoleId);
        }
        if (memberRoleId) {
          await member.roles.remove(memberRoleId).catch((err) => {
            console.error("Member rol kaldirilamadi:", err.message);
          });
        }
      }

      if (emoji === LIGHT_BLUE_HEART) {
        if (member.roles.cache.has(config.girlRoleId)) {
          await member.roles.remove(config.girlRoleId);
        }
        if (!member.roles.cache.has(config.boyRoleId)) {
          await member.roles.add(config.boyRoleId);
        }
        if (memberRoleId) {
          await member.roles.remove(memberRoleId).catch((err) => {
            console.error("Member rol kaldirilamadi:", err.message);
          });
        }
      }
    } catch (error) {
      console.error("Reaction add hatasi:", error.message);
    }
  });

  client.on(Events.MessageReactionRemove, async (reaction, user) => {
    try {
      if (user.bot) return;
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.message.id !== config.reactionRoleMessageId) return;

      const member = await reaction.message.guild.members.fetch(user.id);
      const emoji = reaction.emoji.name;

      if (emoji === PINK_HEART && member.roles.cache.has(config.girlRoleId)) {
        await member.roles.remove(config.girlRoleId);
      }

      if (emoji === LIGHT_BLUE_HEART && member.roles.cache.has(config.boyRoleId)) {
        await member.roles.remove(config.boyRoleId);
      }
    } catch (error) {
      console.error("Reaction remove hatasi:", error.message);
    }
  });
}

client.on(Events.MessageDelete, async (message) => {
  try {
    if (!message?.guild) return;

    const now = Date.now();
    const lastHandledAt = recentDeleteEventIds.get(message.id);
    if (lastHandledAt && now - lastHandledAt < DELETE_EVENT_DEDUPE_MS) return;
    recentDeleteEventIds.set(message.id, now);
    if (recentDeleteEventIds.size > 5000) {
      for (const [id, timestamp] of recentDeleteEventIds) {
        if (now - timestamp > DELETE_EVENT_DEDUPE_MS) {
          recentDeleteEventIds.delete(id);
        }
      }
    }

    const cachedMessage = deletedMessageCache.get(message.id);
    deletedMessageCache.delete(message.id);

    const isBotMessage = message.author?.bot || cachedMessage?.isBot;
    if (isBotMessage) return;

    const deletedAuthorId = message.author?.id || cachedMessage?.authorId || null;
    let deletedTag = message.author?.tag || cachedMessage?.authorTag || "Bilinmiyor";
    const channelId = message.channelId || cachedMessage?.channelId || null;
    const channelLabel = message.channel || cachedMessage?.channelLabel || "Bilinmiyor";
    const deletedContent =
      message.content ||
      message.cleanContent ||
      cachedMessage?.content ||
      "Mesaj icerigi yok (Message Content Intent kapali olabilir)";

    let executorTag = "Bilinmiyor";
    let executorAvatar = message.author?.displayAvatarURL?.({ dynamic: true }) || null;

    if (deletedAuthorId || channelId) {
      const audit = await getMessageDeleteAuditExecutor(
        message.guild,
        deletedAuthorId,
        channelId
      );

      if (audit?.executor) {
        executorTag = audit.executor.tag;
        executorAvatar = audit.executor.displayAvatarURL({ dynamic: true });

        if (deletedTag === "Bilinmiyor" && audit.target?.tag) {
          deletedTag = audit.target.tag;
        }
      }
    }

    if (executorTag === "Bilinmiyor" && deletedTag !== "Bilinmiyor") {
      executorTag = `${deletedTag} (muhtemelen kendi mesajini sildi)`;
    }


    const embed = createLogEmbed(
      "Sistem Bildirimi",
      `Kanal: ${channelLabel}\nSilinen Kullanici: ${deletedTag}\nIcerik: ${truncateField(deletedContent, 900)}`
    );

    await sendLog(message.guild, embed);
  } catch (error) {
    console.error("Mesaj silme log hatasi:", error);
  }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  try {
    if (!newMessage.guild) return;

    if (oldMessage.partial) oldMessage = await oldMessage.fetch().catch(() => null);
    if (newMessage.partial) newMessage = await newMessage.fetch().catch(() => null);

    if (!oldMessage || !newMessage) return;
    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const oldContent = oldMessage.content?.trim()
      ? oldMessage.content.slice(0, 1024)
      : "Yok";

    const newContent = newMessage.content?.trim()
      ? newMessage.content.slice(0, 1024)
      : "Yok";

    const embed = createLogEmbed({
      title: "Sistem Bildirimi",
      emoji: "<:ada:1483438536765210664>",
      executorTag: oldMessage.author.tag,
      executorAvatar: oldMessage.author.displayAvatarURL({ dynamic: true }),
      actionType: "",
      detail: "",
      fields: [
        {
          name: "İşlem Türü",
          value: "Mesaj Düzenleme",
          inline: false
        },
        {
          name: "Kanal",
          value: `${newMessage.channel}`,
          inline: false
        },
        {
          name: "Düzenleyen",
          value: `${oldMessage.author.tag} (${oldMessage.author.id})`,
          inline: false
        },
        {
          name: "Mesaj Linki",
          value: `[Git](${newMessage.url})`,
          inline: false
        },
        {
          name: "Eski",
          value: oldContent,
          inline: false
        },
        {
          name: "Yeni",
          value: newContent,
          inline: false
        }
      ]
    });

    await sendLog(newMessage.guild, embed);
  } catch (error) {
    console.error("Mesaj düzenleme log hatası:", error);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

    if (!addedRoles.size && !removedRoles.size) return;

    await new Promise(resolve => setTimeout(resolve, 1200));

    const logs = await newMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberRoleUpdate,
      limit: 5
    }).catch(() => null);

    if (!logs) return;

    const entry = logs.entries.find(log =>
      log.target?.id === newMember.id &&
      Date.now() - log.createdTimestamp < 10000
    );

    let yapan = entry?.executor || null;

    // executor yoksa da bildirim gönder
    if (yapan && guvenliMi(yapan.id, newMember.guild)) return;

    if (addedRoles.size > 0) {
      await sendGuardLog(newMember.guild, {
        emoji: '<:ada:1483438536765210664>',
        title: 'Kullanıcıya Rol Verildi',
        executor: yapan,
        fields: [
          {
            name: 'Hedef Kullanıcı',
            value: `${newMember.user.tag} (${newMember.id})`,
            inline: false
          },
          {
            name: 'Verilen Rol(ler)',
            value: addedRoles.map(role => `${role}`).join(', ').slice(0, 1024),
            inline: false
          }
        ]
      });
    }

    if (removedRoles.size > 0) {
      await sendGuardLog(newMember.guild, {
        emoji: '<:ada:1483438536765210664>',
        title: 'Kullanıcıdan Rol Alındı',
        executor: yapan,
        fields: [
          {
            name: 'Hedef Kullanıcı',
            value: `${newMember.user.tag} (${newMember.id})`,
            inline: false
          },
          {
            name: 'Alınan Rol(ler)',
            value: removedRoles.map(role => `${role}`).join(', ').slice(0, 1024),
            inline: false
          }
        ]
      });
    }
  } catch (error) {
    console.error('GuildMemberUpdate guard hatası:', error);
  }
});

client.on(Events.GuildBanAdd, async (ban) => {
  try {
    let executorTag = "Bilinmiyor";
    let executorAvatar = ban.user.displayAvatarURL({ dynamic: true });

    await new Promise(resolve => setTimeout(resolve, 1200));

    const logs = await ban.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanAdd,
      limit: 6
    }).catch(() => null);

    if (logs) {
      const entry = logs.entries.find(log =>
        log.target?.id === ban.user.id &&
        Date.now() - log.createdTimestamp < 10000
      );

      if (entry?.executor) {
        executorTag = entry.executor.tag;
        executorAvatar = entry.executor.displayAvatarURL({ dynamic: true });
      }
    }

    const embed = createLogEmbed({
      title: "Sistem Bildirimi",
      emoji: "<:ada:1483438536765210664>",
      executorTag,
      executorAvatar,
      actionType: "",
      detail: "",
      fields: [
        {
          name: "İşlem Türü",
          value: "Banlama",
          inline: false
        },
        {
          name: "Banlanan Kullanıcı",
          value: `${ban.user.tag} (${ban.user.id})`,
          inline: false
        }
      ]
    });

    await sendLog(ban.guild, embed);
  } catch (error) {
    console.error("Ban log hatası:", error);
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const logs = await member.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberKick,
      limit: 6
    }).catch(() => null);

    if (!logs) return;

    const entry = logs.entries.find(log =>
      log.target?.id === member.id &&
      Date.now() - log.createdTimestamp < 10000
    );

    if (!entry?.executor) return;

    const embed = createLogEmbed({
      title: "Sistem Bildirimi",
      emoji: "<:ada:1483438536765210664>",
      executorTag: entry.executor.tag,
      executorAvatar: entry.executor.displayAvatarURL({ dynamic: true }),
      actionType: "",
      detail: "",
      fields: [
        {
          name: "İşlem Türü",
          value: "Kickleme",
          inline: false
        },
        {
          name: "Kicklenen Kullanıcı",
          value: `${member.user.tag} (${member.id})`,
          inline: false
        }
      ]
    });

    await sendLog(member.guild, embed);
  } catch (error) {
    console.error("Kick log hatası:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.commandName === "yardım") {
        const embed = createHelpEmbed();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    if (interaction.commandName === "userinfo") {
      const rawInput = interaction.options.getString("kullanici");
      const user = await resolveUserFromInput(client, rawInput, interaction.user);

      if (!user) {
        return interaction.reply({
          content: "Böyle bir kullanıcı bulunamadı.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("Kullanıcı Bilgileri")
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields([
          { name: "Tag", value: user.tag, inline: true },
          { name: "ID", value: user.id, inline: true },
          { name: "Oluşturulma Tarihi", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
        ]);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "banner") {
    const rawInput = interaction.options.getString("kullanici");
    const user = await resolveUserFromInput(client, rawInput, interaction.user);

    if (!user) {
      return interaction.reply({
        content: "Böyle bir kullanıcı bulunamadı.",
        ephemeral: true
      });
    }

    const banner = await getUserBanner(user);

    if (!banner) {
      return interaction.reply({
        content: "Bu kullanıcının bannerı yok.",
        ephemeral: true
      });
    }

    const embed = createEmbed({
      title: "Banner",
      description: `${user.tag} kullanıcısının bannerı`,
      image: banner,
      thumbnail: user.displayAvatarURL({ dynamic: true, size: 1024 })
    });

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "confess") {
    const rawTarget = interaction.options.getString("kullanici");
    const text = interaction.options.getString("mesaj")?.trim();

    const target = await resolveUserFromInput(client, rawTarget);

    if (!target) {
      return interaction.reply({
        content: "Böyle bir kullanıcı bulunamadı.",
        ephemeral: true
      });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: "Kendine mesaj atamazsın.",
        ephemeral: true
      });
    }

    if (!text) {
      return interaction.reply({
        content: "Bir mesaj yazmalısın.",
        ephemeral: true
      });
    }

    const embed = createConfessEmbed(text);

    try {
      await target.send({ embeds: [embed] });

      return interaction.reply({
        content: "Mesaj gönderildi.",
        ephemeral: true
      });
    } catch (error) {
      console.error("Slash confess hatası:", error);

      return interaction.reply({
        content: "Bu kullanıcının DM'i kapalı veya ortak sunucu yok.",
        ephemeral: true
      });
    }
  }

    if (interaction.commandName === "gif") {
      const attachment = interaction.options.getAttachment("foto");

      if (!attachment) {
        return interaction.reply({
          content: "Bu komutu kullanmak için bir fotoğraf atmalısın.",
          ephemeral: true
        });
      }

      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(attachment.contentType)) {
        return interaction.reply({
          content: "Bu komutu sadece png, jpg, jpeg veya webp ile kullanabilirsin.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content: "Fotoğraf gif'e çevriliyor...",
        ephemeral: true
      });

      try {
        const tempDir = path.join(__dirname, "temp");
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }

        const inputPath = path.join(tempDir, `input${Date.now()}`);
        const outputPath = path.join(tempDir, `output_${Date.now()}.gif`);

        const response = await axios.get(attachment.url, {
          responseType: "arraybuffer"
        });

        fs.writeFileSync(inputPath, response.data);

        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .outputOptions([
              "-vf", "split[s0][s1];[s0]palettegen=stats_mode=single[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5",
              "-loop", "0"
            ])
            .toFormat("gif")
            .save(outputPath)
            .on("end", resolve)
            .on("error", reject);
        });

        await interaction.followUp({
          content: "al knk gif hazır",
          files: [outputPath]
        });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

      } catch (error) {
        console.error("Gif çevirme hatası:", error);

        return interaction.followUp({
          content: "Fotoğrafı gif'e çevirirken bir hata meydana geldi.",
          ephemeral: true
        });
      }
    }
});

client.on(Events.ChannelDelete, async (channel) => {
  try {
    const guild = channel.guild;
    if (!guild) return;

    await new Promise(resolve => setTimeout(resolve, 1200));

    const logs = await guild.fetchAuditLogs({
      type: AuditLogEvent.ChannelDelete,
      limit: 5
    }).catch(() => null);

    if (!logs) return;

    const entry = logs.entries.find(log =>
      log.target?.id === channel.id &&
      Date.now() - log.createdTimestamp < 10000
    );

    if (!entry?.executor) return;

    const yapan = entry.executor;

    if (guvenliMi(yapan.id, guild)) return;

    await sendGuardLog(guild, {
      emoji: '<:ada:1483438536765210664> ',
      title: 'Kanal Silme Tespit Edildi',
      executor: yapan,
      fields: [
        {
          name: 'Silinen Kanal',
          value: `${channel.name} (${channel.id})`,
          inline: false
        },
        {
          name: 'Durum',
          value: 'Whitelist dışı kullanıcı kanal sildi',
          inline: false
        }
      ]
    });
  } catch (error) {
    console.error('ChannelDelete guard hatası:', error);
  }
});

client.on(Events.RoleDelete, async (role) => {
  try {
    const guild = role.guild;
    if (!guild) return;

    await new Promise(resolve => setTimeout(resolve, 1200));

    const logs = await guild.fetchAuditLogs({
      type: AuditLogEvent.RoleDelete,
      limit: 5
    }).catch(() => null);

    if (!logs) return;

    const entry = logs.entries.find(log =>
      log.target?.id === role.id &&
      Date.now() - log.createdTimestamp < 10000
    );

    if (!entry?.executor) return;

    const yapan = entry.executor;

    if (guvenliMi(yapan.id, guild)) return;

    await sendGuardLog(guild, {
      emoji: '<:ada:1483438536765210664> ',
      title: 'Rol Silme Tespit Edildi',
      executor: yapan,
      fields: [
        {
          name: 'Silinen Rol',
          value: `${role.name} (${role.id})`,
          inline: false
        },
        {
          name: 'Durum',
          value: "Whitelist'te olmayan bir kullanıcı rol sildi.",
          inline: false
        }
      ]
    });
  } catch (error) {
    console.error('RoleDelete guard hatası:', error);
  }
});

client.on(Events.RoleUpdate, async (oldRole, newRole) => {
  try {
    const oldAdmin = oldRole.permissions.has(PermissionsBitField.Flags.Administrator);
    const newAdmin = newRole.permissions.has(PermissionsBitField.Flags.Administrator);

    if (oldAdmin || !newAdmin) return;

    const guild = newRole.guild;

    await new Promise(resolve => setTimeout(resolve, 1200));

    const logs = await guild.fetchAuditLogs({
      type: AuditLogEvent.RoleUpdate,
      limit: 5
    }).catch(() => null);

    if (!logs) return;

    const entry = logs.entries.find(log =>
      log.target?.id === newRole.id &&
      Date.now() - log.createdTimestamp < 10000
    );

    if (!entry?.executor) return;

    const yapan = entry.executor;

    if (guvenliMi(yapan.id, guild)) return;

    await sendGuardLog(guild, {
      emoji: '<:ada:1483438536765210664> ',
      title: 'Role Admin Yetkisi Verildi',
      executor: yapan,
      fields: [
        {
          name: 'Rol',
          value: `${newRole.name} (${newRole.id})`,
          inline: false
        },
        {
          name: 'Durum',
          value: "Whitelist'in dışındaki bir kullanıcı bir role Administrator verdi.",
          inline: false
        }
      ]
    });
  } catch (error) {
    console.error('RoleUpdate admin guard hatası:', error);
  }
});

client.login(token);