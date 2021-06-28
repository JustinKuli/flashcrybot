import React from 'react';

import { ChatClient } from 'twitch-chat-client';
import { StaticAuthProvider } from 'twitch-auth';

import { Translate } from '@google-cloud/translate/build/src/v2';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import connection from './config/connection.js';
import config from './config/bot-config.js';

let allVoices;
let favVoice;
 
function refreshVoices() {
  allVoices = window.speechSynthesis.getVoices()
  const enVoices = allVoices.filter((v) => v.lang.startsWith('en'))
  const localVoices = enVoices.filter((v) => v.localService)
  const possibleFavorite = allVoices.filter(config.favVoiceFilter)
  favVoice = possibleFavorite[0] || localVoices[0] || enVoices[0] || allVoices[0]
}

function handleMessage(chat, translator) {
  refreshVoices()

  const tts = (user, msg, lang) => {
    if (allVoices.length < config.targetVoiceCount) {
      // Sometimes, the first time the voices are retrieved, it's an empty list.
      refreshVoices()
      console.log('favVoice.name', favVoice?.name)
    }

    if (msg.length > config.maxTTSLength) {
      console.log(`message is too long to read out loud: ${msg}`)
      return
    }

    const phraseWords = config.ttsSayUser ? `${user} - ${msg}` : msg
    let phrase = new SpeechSynthesisUtterance(phraseWords)
    if (lang === 'en') {
      phrase.voice = favVoice
    } else {
      const langVoices = allVoices.filter((v) => v.lang.startsWith(lang))
      phrase.voice = langVoices[0] || favVoice
    }

    window.speechSynthesis.speak(phrase)
  }

  return (chan, user, msg) => {
    if (config.denylist.indexOf(user) !== -1) {
      return
    }

    for (const simple of config.simpleCommands) {
      if (msg.startsWith(simple.cmd)) {
        chat.say(chan, simple.resp)
        return
      }
    }

    translator.detect(msg, (err, det) => {
      if (err) {
        console.log(err)
        return
      }
      if (det.confidence > config.reqLangDetectionConfidence) {
        if (det.language !== 'en') {
          if (config.speakInForeignLanguage) {
            tts(user, msg, det.language)
          }
          translator.translate(msg, 'en').then((trans) => {
            chat.say(chan, `(${det.language} -> en) ${user}: ${trans[0]}`)
            tts(user, trans[0], 'en')
          })
        } else {
          tts(user, msg, 'en')
        }
      } else {
        console.log(`message from ${user} could not be understood: ${msg}`)
      }
    })
  }
}

class BotForm extends React.Component {

  singletonActive = false
  
  doTheThing = () => {
    if (this.singletonActive) {
      console.log('bot already active')
      return
    }

    const streamer = document.getElementById('formStreamer').value
    const clientId = document.getElementById('formBotID').value
    const accessToken = document.getElementById('formBotAccessToken').value
    const googleProjectID = document.getElementById('formGoogleProjectID').value
    const googleMail = document.getElementById('formGoogleMail').value
    const googleKey = document.getElementById('formGoogleKey').value
    
    const authProvider = new StaticAuthProvider(clientId, accessToken);
    const chat = new ChatClient(authProvider, { channels: [streamer]});

    const googleOpts = {
      projectId: googleProjectID,
      credentials: {
        client_email: googleMail,
        private_key: googleKey
      },
      fallback: false
    }

    const translator = new Translate(googleOpts);

    chat.connect().then(() => {
      chat.onMessage(handleMessage(chat, translator))
    })
  }

  render() {
    return <Form>
      <Form.Group controlId="formStreamer">
        <Form.Label>Streamer Name</Form.Label>
        <Form.Control type="text" defaultValue="FlashcrySamurai" />
        <Form.Text className="text-muted">
            The bot will connect to this channel.
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBotID">
        <Form.Label>Bot Client ID</Form.Label>
        <Form.Control type="text" defaultValue={connection['bot-id']}/>
      </Form.Group>

      <Form.Group controlId="formBotAccessToken">
        <Form.Label>Bot Access Token</Form.Label>
        <Form.Control type="password" />
      </Form.Group>

      <Form.Group controlId="formGoogleProjectID">
        <Form.Label>Google Project ID</Form.Label>
        <Form.Control type="text" defaultValue={connection['google-project-id']}/>
      </Form.Group>

      <Form.Group controlId="formGoogleMail">
        <Form.Label>Google Client Email</Form.Label>
        <Form.Control type="text" defaultValue={connection['google-email']}/>
      </Form.Group>

      <Form.Group controlId="formGoogleKey">
        <Form.Label>Google Key</Form.Label>
        <Form.Control as="textarea" rows={10} />
      </Form.Group>

      <Button variant="primary" onClick={this.doTheThing}>
        Start the bot!
      </Button>
    </Form>
  }
}

export default BotForm;
