// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import Discord from 'discord.js'
import fs from 'fs'
import * as dotenv from 'dotenv'
import YAML from 'yaml'
import { IClientYTP } from './interfaces/interfaces'
import { log } from './functions/log'
import { twitchUpdate, updateTwitchAuth } from './modules/twitch'
import { ytUpdate } from './modules/youtube'

const YouTubePoster = require('discord-yt-poster')

dotenv.config()

const config = YAML.parse(fs.readFileSync('./config.yaml', 'utf8'))

if (!fs.existsSync('./sendedVideos.yaml')) {
  const defaultSendedVideos = { sendedVideos: [] }
  fs.writeFileSync('./sendedVideos.yaml', YAML.stringify(defaultSendedVideos))
}
if (!YAML.parse(fs.readFileSync('./sendedVideos.yaml', 'utf8')).sendedVideos) {
  const defaultSendedVideos = { sendedVideos: [] }
  fs.writeFileSync('./sendedVideos.yaml', YAML.stringify(defaultSendedVideos))
}

// throw new Error('Missing Discord Token')

const client: IClientYTP = new Discord.Client({
  restTimeOffset: 0,
  shards: 'auto',
  restWsBridgeTimeout: 100,
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_BANS',
    'GUILD_INTEGRATIONS',
    'GUILD_WEBHOOKS',
    'GUILD_INVITES',
    'GUILD_VOICE_STATES',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING'
  ]
})

log.info('Starting up...')

client.on('ready', async () => {
  if (!client) throw new Error('Client is not defined')
  if (!client.user) throw new Error('Client user is not defined')
  log.info(`Logged in as ${client.user.tag}!`)

  client.YTP = new YouTubePoster(client)

  await updateTwitchAuth()
  await twitchUpdate()
  await ytUpdate()
  setInterval(async () => { await updateTwitchAuth() }, 3600000) // Update auth key every hour
  setInterval(async () => { await twitchUpdate(client) }, config.updateInterval)
  setInterval(async () => { await ytUpdate(client) }, config.updateInterval)
})

if (!process.env.DISCORD_TOKEN) throw new Error('Missing Discord Token')
client.login(process.env.DISCORD_TOKEN)
