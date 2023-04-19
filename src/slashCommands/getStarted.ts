import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";

const getStartedCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("get-started")
    .setDescription("Start earning from interest protocol"),
  execute: async (interaction) => {
    const discordId = interaction.user.id;

    const user = await prisma.user.findUnique({ where: { discordId } });

    if (user) {
      return interaction.reply({
        content: `Hi ${interaction.user.username}, You are already a part of this event`,
      });
    }

    const { error, message, zealy_data } = await findById(discordId);

    if (error) {
      return interaction.reply({
        content: `An error occuring getting you started. please make sure you have joined the zealy community by completing at least one task`,
        ephemeral: true,
      });
    }

    if (zealy_data == null) {
      return interaction.reply({
        content: `An error occuring getting you started. please make sure you have joined the zealy community by completing at least one task`,
        ephemeral: true,
      });
    }

    await prisma.user.create({
      data: {
        discordId,
        name: zealy_data.name,
        discordHandle: zealy_data.discordHandle,
        prevXp: zealy_data.xp,
        currentXp: zealy_data.xp,
        level: zealy_data.level,
        rank: zealy_data.rank,
      },
    });

    return interaction.reply({
      content: `Hi ${interaction.user.username}, Welcome to this event. use the points command to see your earnings.`,
      ephemeral: true,
    });
  },
};

export default getStartedCommand;
