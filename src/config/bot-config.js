const props = {
    // Easily configurable:
    maxTTSLength: 100,
    speakInForeignLanguage: true,
    repeatInEnglish: false,
    ttsSayUser: false,
    replaceEmotes: true, // see emote-replacement.js
    shortenLinks: true,

    denylist: [
        'flashcrybot',
        'zbarfbot',
        'botoftakeout',
    ],

    // Simple commands are just calls and responses.
    simpleCommands: [
        { cmd: '!tts', resp: 'I am saying messages out loud' },
        { cmd: '!translate', resp: 'I am translating into English' },
        { cmd: '!bot', resp: 'View my code at https://github.com/JustinKuli/flashcrybot' },
    ],

    // More complicated properties (for advanced users):
    reqLangDetectionConfidence: 0.0,
    targetVoiceCount: 5,

    favVoiceFilter: (v) => v.voiceURI.includes('Zira'),
}

export default props
