const Discord = require("discord.js");
const config = require("./config.json");
const request = require("request");

const client = new Discord.Client();
client.login(config.BOT_TOKEN);

const stateNames = Object.freeze([
  "Nevada",
  "Pennsylvania",
  "Georgia",
  "North Carolina",
  "Arizona",
]);
const command = "!election";

client.on("message", msg => {
  if (msg.content !== command) {
    return;
  }

  request(config.API_ENDPOINT, { json: true }, (err, res, body) => {
    err ? msg.channel.send("BOT BROKE")
      : msg.channel.send(apiResponseToMessage(body));
  });
});

const apiResponseToMessage = apiResponse => stateNames.map(name => {
    const state = apiResponse.find(s => s.stateName === name);
    const biden = state.candidates.find(c => c.lastNameSlug === "biden");
    const trump = state.candidates.find(c => c.lastNameSlug === "trump");
    const bidenVoteStr = `🔵 Joe Biden: ${biden.voteNum.toLocaleString()} (${biden.votePercentStr}%)\n`;
    const trumpVoteStr = `🔴 Donald Trump: ${trump.voteNum.toLocaleString()} (${trump.votePercentStr}%)\n`;

    return (
      `${state.stateName}:\n` +
      (biden.voteNum > trump.voteNum
        ? bidenVoteStr + trumpVoteStr
        : trumpVoteStr + bidenVoteStr) +
      `Reporting: ${state.percentReporting}%\n` +
      `${state.editorialStatus === "called" ? "Called" : "Not called"}`
    );
  }).join("\n\n");