import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../lib/prisma";

const getStarted: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("get-started")
    .setDescription("Start earning from interest protocol"),
  execute: async (interaction) => {
    const users = await prisma.user.findMany({});
    interaction.reply({
      content: `only you should see this ${users.map((user) => user.id)}`,
      ephemeral: true,
    });
  },
};

export default getStarted;
