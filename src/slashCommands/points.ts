import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";
import { formatEarning } from "../utils/helper";

const pointsCommand: SlashCommand = {
  cooldown: 30,
  command: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Check your earned points"),

  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;

    const username = interaction.user.username;

    const user = await prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x99bbff)
            .setAuthor({ name: "⚠️  Error" })
            .setDescription(
              `Hi ${username},
You don't seem to be registered. Have you ran the get-started command?`
            ),
        ],
      });
    }

    const { error, zealy_data } = await findById(discordId);

    if (error) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x99bbff)
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
            .setColor(0x99bbff)
            .setAuthor({ name: "⚠️  Error" })
            .setDescription(
              `Please make sure you have joined the zealy community by completing at least one task`
            ),
        ],
      });
    }

    const updated_user = await prisma.user.update({
      where: {
        discordId,
      },
      data: {
        currentXp: zealy_data.xp,
        level: zealy_data.level,
        rank: zealy_data.rank,
      },
    });

    const { booster, currentXp, earnedXp, ipx_with_booster } =
      formatEarning(updated_user);

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x99bbff)
          .setAuthor({ name: "💸 Your Earnings" })
          .setDescription(
            `Hi ${username},

Total Earnings: ${ipx_with_booster} IPX
Current Booster: ${booster}x
XP Earned: ${earnedXp} XP
Total XP: ${currentXp} XP
`
          ),
      ],
    });
  },
};

export default pointsCommand;
