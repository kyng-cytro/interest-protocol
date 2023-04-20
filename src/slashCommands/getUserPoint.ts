import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";
import { formatEarning } from "../utils/helper";

const userPointCommand: SlashCommand = {
  cooldown: 5,
  command: new SlashCommandBuilder()
    .setName("user-points")
    .setDescription("Get point infor for a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to get point info for")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const target_user = interaction.options.getUser("user");

    const discordId = target_user.id;

    const username = interaction.user.username;

    const user = await prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder().setAuthor({ name: "⚠️  Error" }).setDescription(
            `Hi ${username},
This user does't seem to be registered.`
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
              `Please make sure this user has joined the zealy community by completing at least one task`
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
              `Please make sure this user has joined the zealy community by completing at least one task`
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
          .setAuthor({ name: `💸 ${user.name} Earnings` })
          .setDescription(
            `Total Earnings: ${ipx_with_booster} IPX
Current Booster: ${booster}x
XP Earned: ${earnedXp} XP
Total XP: ${currentXp} XP
`
          ),
      ],
    });
  },
};

export default userPointCommand;
