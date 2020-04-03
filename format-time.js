module.exports = _seconds => {
    const minutes = Math.floor( _seconds / 60 )
    const seconds = Math.floor( _seconds - ( minutes * 60 ) )
    const formattedMinutes = `${minutes + 100}`.slice(1)
    const formattedSeconds = `${seconds + 100}`.slice(1)
    return `${formattedMinutes}:${formattedSeconds}`
}