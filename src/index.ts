import {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
  Partials,
  REST,
  Routes,
  Collection,
} from "discord.js";

import type { SlashCommand } from "./types";
import testCommand from "./slashCommands/ping";
import getStartedCommand from "./slashCommands/getStarted";
import pointsCommand from "./slashCommands/points";
import userPointCommand from "./slashCommands/getUserPoint";
import leaderBoardCommand from "./slashCommands/leaderBoard";

import enviromentVars from "./config";

const token = enviromentVars.DISCORD_TOKEN;
const client_id = enviromentVars.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

const slashCommands = new Collection<string, SlashCommand>();

slashCommands.set(testCommand.command.name, testCommand);
slashCommands.set(getStartedCommand.command.name, getStartedCommand);
slashCommands.set(pointsCommand.command.name, pointsCommand);
slashCommands.set(userPointCommand.command.name, userPointCommand);
slashCommands.set(leaderBoardCommand.command.name, leaderBoardCommand);

const slashCommandsArr: SlashCommandBuilder[] = [
  testCommand.command,
  getStartedCommand.command,
  pointsCommand.command,
  userPointCommand.command,
  leaderBoardCommand.command,
];

const rest = new REST({ version: "10" }).setToken(token);
rest
  .put(Routes.applicationCommands(client_id), {
    body: slashCommandsArr.map((command) => command.toJSON()),
  })
  .then((data: any) => {
    console.log(`🔥 Successfully loaded ${data.length} slash command(s)`);
  })
  .catch((e) => {
    console.log(e);
  });

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = slashCommands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});
client
  .login(token)
  .catch((error) => console.error("Discord.Client.Login.Error", error));
