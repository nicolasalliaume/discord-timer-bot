require( 'dotenv' ).config();
const Discord = require( 'discord.js' )
const formatTime = require('./format-time')

const UPDATE_INTERVAL = parseFloat( process.env.UPDATE_INTERVAL || "30" )

const client = new Discord.Client()

const isProfe = username => process.env.PROFES.split( ',' ).includes( username )

const isBotCommand = message => message.content.startsWith( process.env.COMMAND_PREFIX )

let activeTimers = {}

const buildMessageEmbed = ( time, secondsLeft, color='#00ff00' ) => ({
    embed: {
        title: `Here's a timer ⏱`,
        fields: [
            {
                name: 'Time',
                value: `${time} minute${ time > 1 ? 's' : '' }`
            },
            {
                name: 'Left',
                value: formatTime( secondsLeft )
            }
        ],
        description: `#protip: Always prioritize!`,
        color
    }
})

client.on( 'ready', () => {
    console.log( 'Bot is connected' )
} )

client.on( 'message', async message => {
    const {
        author: { username },
        channel,
        content
    } = message

    if ( ! isBotCommand( message ) ) return; // skip general messages

    if ( ! isProfe( username ) ) {
        // skip students messages for now
        return message.channel.send(`I only respond to The Profes 🙅‍♂️`)
    }

    const command = content.split( / +/ )

    try {

        switch ( command[ 1 ] ) {
            
            case 'cancel': {
                if ( ! activeTimers[channel.id] ) {
                    throw new Error()
                }
                
                channel.send( `❌ Cancelled active timer` )

                // cleanup
                clearInterval( activeTimers[channel.id].timer )
                delete activeTimers[channel.id]
                
                break
            }
            
            default: {
                const time = parseInt( command[ 1 ] )
                if ( ! time ) throw new Error()
    
                const embed = buildMessageEmbed( time, time * 60 )
                    
                const response = await channel.send(embed)
    
                const sendUpdate = async () => {
                    if ( ! activeTimers[channel.id] ) {
                        return // timer cancelled
                    }
    
                    const response = activeTimers[channel.id].response
                    const secondsLeft = Math.max( 0, activeTimers[channel.id].end - ( Date.now() / 1000 ) )
                    
                    activeTimers[channel.id].response = await response.edit( 
                        buildMessageEmbed( 
                            time, 
                            secondsLeft, 
                            secondsLeft === 0 ? '#ff0000' : undefined 
                        ) 
                    )

                    if ( secondsLeft === 0 ) {
                        // cleanup
                        clearInterval( activeTimers[ channel.id ].timer )
                        delete activeTimers[ channel.id ]
    
                        channel.send( '@everyone Time\'s up!' )
                    } 
                }
                    
                activeTimers[ channel.id ] = {
                    time,
                    response,
                    end: ( Date.now() / 1000 ) + ( time * 60 ),
                    timer: setInterval(sendUpdate, UPDATE_INTERVAL * 1000 )
                }
                
            }
        }
    }
    catch {
        return channel.send( `🤷‍♂️ Can you repeat that?` )
    }
    
} )

client.login(process.env.BOT_TOKEN)
