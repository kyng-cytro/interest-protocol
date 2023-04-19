import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";
import { formatEarning } from "../utils/helper";

const userPointCommand: SlashCommand = {
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
    const target_user = interaction.options.getUser("user");

    const discordId = target_user.id;

    const username = interaction.user.username;

    const user = await prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return interaction.reply({
        content: `Hi ${username}, This user does't seem to be registered. Have you ran the get-started command?`,
        ephemeral: true,
      });
    }

    const { error, zealy_data } = await findById(discordId);

    if (error) {
      return interaction.reply({
        content: `An error occuring getting you started. please make sure this user has joined the zealy community by completing at least one task`,
        ephemeral: true,
      });
    }

    if (zealy_data == null) {
      return interaction.reply({
        content: `An error occuring getting you started. please make sure this user has joined the zealy community by completing at least one task`,
        ephemeral: true,
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

    const {
      booster,
      currentXp,
      startingXp,
      earnedXp,
      ipx_value,
      ipx_with_booster,
    } = formatEarning(updated_user);

    return interaction.reply({
      content: `Hi ${username}, This user has earned a total of: ${ipx_with_booster}IPX. Thier current booster: ${booster}x, Earned IPX without booster: ${ipx_value}IPX, Total XP earned during the event: ${earnedXp}XP, Total XP earned: ${currentXp}XP, Total XP before event: ${startingXp}XP`,
      ephemeral: true,
    });
  },
};

export default userPointCommand;
