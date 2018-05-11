const Discord = require("discord.js");
const auth = require("./auth.json");
const dateDifference = require("date-difference");
const client = new Discord.Client();
const parsers = require('./parsers.js')

// Reaction numbers as Unicode, reacting with them normally doesn't work
var reaction_numbers = ["\u0030\u20E3", "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"];
const startTime = new Date();

client.on("ready", () => {
    console.log("I am ready!");
    client.user.setUsername("MunchBot");
});

// Triggered when message is sent in server
client.on("message", (message) => {

    // Prevent loop from bots own messages
    if (message.author.bot) return;

    // Get command and its arguments
    if (message.content.startsWith('!')) {

        let command = parsers.parseCommand(message.content)

        console.log('MunchBot received command: ' + command)

        // Creating a raid
        if (command === "tr") {

            let raid = parsers.parseRaid(message.content)
            let msg = parsers.raidToMessage(raid)

            message.delete()
                .catch((e) => {
                    console.log(e)
                })
            message.channel.send(msg)
                .then((message) => {
                    return message.react(reaction_numbers[0])
                })
                .then((reaction) => {
                    return reaction.message.react(reaction_numbers[1])
                })
                .then((reaction) => {
                    return reaction.message.react(reaction_numbers[2])
                })
                .then((reaction) => {
                    return reaction.message.react(reaction_numbers[3])
                })
                .catch((e) => {
                    console.error(e)
                })

        }

        // PingPong!
        if (command === "ping") {
            message.channel.send("pong!`" + (new Date().getTime() - message.createdTimestamp) + "ms`");
        }
    }
});

function addTrainerToRaid (reaction, user) {

    let raid = parsers.messageToRaid(reaction.message)
    let trainer = getNick(reaction, user)

    raid.trainers.push(trainer)

    let message = parsers.raidToMessage(raid)

    reaction.message.edit(message)

}

function removeTrainerFromRaid (reaction, user) {

    let raid = parsers.messageToRaid(reaction.message)
    let trainer = getNick(reaction, user)

    raid.trainers.splice(raid.trainers.indexOf(trainer), 1)

    let message = parsers.raidToMessage(raid)

    reaction.message.edit(message)

}

function getCount (reaction) {
    return (reaction_numbers.indexOf(reaction.emoji.name))
}

// Displays trainer name and possible friends in "+2" style
function getNick (reaction, user) {

    let trainer = user.username
    const friends = getCount(reaction) - 1 // user is included in the count
    if (friends > 0) {
        trainer += ' +' + friends
    }
    return trainer
}

function isValidUser (user) {
    return !user.bot
}

function isValidReaction (reaction) {
    // Message is not from MunchBot
    if (reaction.message.author.id !== client.user.id) {
        return false
    }
    // Reaction is not from our own list
    if (!reaction_numbers.includes(reaction.emoji.name)) {
        return false
    }
    return true
}

client.on('messageReactionAdd', (reaction, user) => {
    if (isValidUser(user) && isValidReaction(reaction)) {
        addTrainerToRaid(reaction, user)
    }
})

client.on('messageReactionRemove', (reaction, user) => {
    if (isValidUser(user) && isValidReaction(reaction)) {
        removeTrainerFromRaid(reaction, user)
    }
})

client.login(auth.token);
