// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import axios from 'axios'
import YAML from 'yaml'
import fs from 'fs'
import getColors from 'get-image-colors'
import Discord, { MessageEmbed } from 'discord.js'
import { log } from '../functions/log'
import { IClientYTP } from '../interfaces/interfaces'

const config = YAML.parse(fs.readFileSync('./config.yaml', 'utf8'))

export const ytUpdate: any = async function (client: IClientYTP) {
  try {
    const sendedVideosTempData = YAML.parse(fs.readFileSync('./sendedVideos.yaml', 'utf8'))
    log.info('Updating YouTube channels...')
    const ytChannels = config.ytChannels
    for (let i = 0; i < ytChannels.length; i++) {
      const ytChannel = ytChannels[i]
      const channelLink = `https://www.youtube.com/channel/${ytChannel}`
      try {
        const latestVideosJson = await client.YTP.getLatestVideos(channelLink)
        latestVideosJson.reverse()
        for (let j = 0; j < latestVideosJson.length; j++) {
          const videoJson = latestVideosJson[j]
          if (!sendedVideosTempData.sendedVideos.includes(videoJson.id)) {
            log.info(videoJson.title)
            sendedVideosTempData.sendedVideos.push(videoJson.id)
            const thumbnailImgResponse = await axios.get(`https://i.ytimg.com/vi/${videoJson.id}/hqdefault.jpg`, { responseType: 'arraybuffer' })
            const options: getColors.Options = { count: 1, type: 'image/jpg' }
            const color = (await getColors(thumbnailImgResponse.data, options))[0]
            const colorHex = color.hex()
            const ascentColor = parseInt(colorHex.replace('#', '0x'), 16)

            const embed = new MessageEmbed()
              .setTitle(videoJson.title)
              .setDescription('Novo vídeo de ' + videoJson.author)
              .setURL(videoJson.link)
              .setColor(ascentColor)
              .setFooter({ text: 'GD-NEWS', iconURL: 'https://cdn.discordapp.com/avatars/942191372033736715/246ab953d618ebc0a80eb1203cb66bd9.webp' })
              .setImage(`https://i.ytimg.com/vi/${videoJson.id}/mqdefault.jpg`)

            const msgContent: {
                content?: string,
                embeds?: [Discord.MessageEmbed],
              } = {}

            if (config.ytNotifyDiscordRoleID) msgContent.content = `<@&${config.ytNotifyDiscordRoleID}>`

            msgContent.embeds = [embed]

            const channel = client.channels.cache.get(config.ytDiscordChannelId)
            if (!channel) return log.error('Channel not found')
            if (channel.type !== 'GUILD_NEWS') return log.error('Channel is not a text channel: ' + channel.type)
            channel.send(msgContent).catch(log.error)
            fs.writeFileSync('./sendedVideos.yaml', YAML.stringify(sendedVideosTempData))
          };
        }
      } catch (err) {
        log.error(err, 'Error updating YouTube channel ' + channelLink)
      }
    }
  } catch (err) { log.error(err) }
}
