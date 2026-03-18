const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.log("CLIENT_ID:", process.env.CLIENT_ID);
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Bir kullanıcının bannerını gösterir")
    .addStringOption(option =>
      option
        .setName("kullanici")
        .setDescription("Kullanıcı ID'si veya mention")
        .setRequired(false)
    )
    .setDMPermission(true),
  new SlashCommandBuilder()
    .setName("confess")
    .setDescription("Bir kullanıcıya anonim mesaj gönderir.")
    .addStringOption(option =>
      option
        .setName("kullanici")
        .setDescription("Kullanıcı ID'si veya mention")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("mesaj")
        .setDescription("Gönderilecek anonim mesaj")
        .setRequired(true)
    )
    .setDMPermission(true),
  new SlashCommandBuilder()
    .setName("gif")
    .setDescription("Atılan fotoğrafı gif formatına çevirir")
    .addAttachmentOption(option =>
      option
        .setName("foto")
        .setDescription("Gif'e çevrilecek fotoğraf")
        .setRequired(true)
    )
  ,
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Bir kullanıcının bilgilerini gösterir.")
    .addStringOption(option =>
      option
        .setName("kullanici")
        .setDescription("Kullanıcı ID'si veya mention")
        .setRequired(false)
    )
    .setDMPermission(true),
  new SlashCommandBuilder()
    .setName("yardım")
    .setDescription("Bot komutlarını gösterir.")
    .setDMPermission(true)
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Slash komutlar yüklendi");
  } catch (error) {
    console.error(error);
  }
})();
