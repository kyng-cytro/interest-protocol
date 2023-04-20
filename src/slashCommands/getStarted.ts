import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";

const getStartedCommand: SlashCommand = {
  cooldown: 1000,
  command: new SlashCommandBuilder()
    .setName("get-started")
    .setDescription("Start earning from interest protocol"),
  execute: async (interaction) => {
    
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;

    const username = interaction.user.username;

    const user = await prisma.user.findUnique({ where: { discordId } });

    if (user) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: "⚠️  Error" })
            .setDescription(
              `Hi ${username},
You are already a part of this event`
            ),
        ],
      });
    }

    const { error, zealy_data } = await findById(discordId);

    if (error) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: "⚠️  Error" })
            .setDescription(
              `Please make sure you have joined the zealy community by completing at least one task`
            ),
        ],
      });
    }

    if (zealy_data == null) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: "⚠️  Error" })
            .setDescription(
              `Please make sure you have joined the zealy community by completing at least one task`
            ),
        ],
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

    return interaction.editReply({
      embeds: [
        new EmbedBuilder().setAuthor({ name: "🎉 Welcome" }).setDescription(
          `Points earned on zealy will now count toward your IPX earning.
Use /points to view your earnings`
        ),
      ],
    });
  },
};

export default getStartedCommand;
