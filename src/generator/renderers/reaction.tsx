import { DiscordReactions, DiscordReaction } from '@derockdev/discord-components-react';
import React from 'react';
import { type Message, Emoji, APIMessageComponentEmoji, MessageReaction } from 'discord.js';
import type { RenderMessageContext, } from '..';
// import type { AttachmentTypes } from '../../types';
// import { downloadImageToDataURL, formatBytes } from '../../utils/utils';
import { request } from 'undici';
import twemoji from 'twemoji';


export default async function renderReaction(message: Message, context2: RenderMessageContext){
  if(message.reactions.cache.size === 0) return null;
return (
<>
  {await Promise.all(message.reactions.cache.map((reactions, id) => renderReaction2(message, reactions, context2, id)))}
  </>
    
)


}

export async function renderReaction2(message: Message, reaction: MessageReaction, context: RenderMessageContext, id: any){

  let DataURL = `${await parseReactionEmoji(reaction.emoji, context)}`


return (
  <DiscordReactions slot="reactions">     
    <DiscordReaction
      key={`${message.id}${id}`}
      name={reaction.emoji.name!}
      emoji={DataURL}
      count={reaction.count}
    />
</DiscordReactions>
)
}

export async function parseReactionEmoji(Emoji: Emoji | APIMessageComponentEmoji, context2: RenderMessageContext) {
  if (Emoji.id) {
    if(context2.FileConfig?.SaveExternalEmojis){
      const response = await request(`https://cdn.discordapp.com/emojis/${Emoji.id}.${Emoji.animated ? 'gif' : 'png'}`);
  
      const dataURL = await response.body
        .arrayBuffer()
        .then((res) => {
          const data = Buffer.from(res).toString('base64');
          const mime = response.headers['content-type'];
    
          return `data:${mime};base64,${data}`;
        })
        .catch((err) => {
          if (!process.env.HIDE_TRANSCRIPT_ERRORS) {
            console.error(`[discord-html-transcripts] Failed to download image for transcript: `, err);
          }
    
          return null;
        });
    
        return dataURL
    }
      return `https://cdn.discordapp.com/emojis/${Emoji.id}.${Emoji.animated ? 'gif' : 'png'}`;
    }
  
    const codepoints = twemoji.convert
      .toCodePoint(
        Emoji.name!.indexOf(String.fromCharCode(0x200d)) < 0 ? Emoji.name!.replace(/\uFE0F/g, '') : Emoji.name!
      )
      .toLowerCase();
  
    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
}