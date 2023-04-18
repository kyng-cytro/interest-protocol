import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const getStarted: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("get-started")
    .setDescription("Start earning from interest protocol"),
  execute: async (interaction) => {
    interaction.reply({ content: "only you should see this", ephemeral: true });
  },
};

export default getStarted;
