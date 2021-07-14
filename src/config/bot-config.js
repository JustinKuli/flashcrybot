const props = {
    maxTTSLength: 100,
    reqLangDetectionConfidence: 0.0,
    targetVoiceCount: 5,
    
    speakInForeignLanguage: true,
    repeatInEnglish: false,
    ttsSayUser: false,
    replaceEmotes: true,
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
    ],

    favVoiceFilter: (v) => v.voiceURI.includes('Zira'),
}

export default props
