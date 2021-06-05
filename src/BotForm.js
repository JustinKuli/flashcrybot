import React from 'react';

import { ChatClient } from 'twitch-chat-client';
import { StaticAuthProvider } from 'twitch-auth';

import { Translate } from '@google-cloud/translate/build/src/v2';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

let allVoices;
let enVoices;
let localVoices;
let enVoice;

function refreshVoices() {
  allVoices = window.speechSynthesis.getVoices()
  enVoices = allVoices.filter((v) => v.lang.startsWith('en'))
  localVoices = enVoices.filter((v) => v.localService)
  enVoice = localVoices[1] || localVoices[0] || enVoices[0]
}

function handleMessage(chat, translator) {
  refreshVoices()

  const tts = (user, msg, lang) => {
    refreshVoices()
    console.log('enVoice.name', enVoice?.name)

    if (msg.length > 100) {
      console.log(`message is too long to read out loud: ${msg}`)
      return
    }

    let phrase = new SpeechSynthesisUtterance(`${user} - ${msg}`)
    if (lang === 'en') {
      phrase.voice = enVoice
    } else {
      const langVoices = allVoices.filter((v) => v.lang.startsWith(lang))
      phrase.voice = langVoices[0] || enVoice
    }

    window.speechSynthesis.speak(phrase)
  }

  return (chan, user, msg) => {
    if (user === "flashcrybot" || user === "zbarfbot") {
      return
    }

    if (msg.startsWith('!tts')) {
      chat.say(chan, "I am saying messages out loud");
      return
    }
    if (msg.startsWith('!translate')) {
      chat.say(chan, "I am translating into English");
      return
    }


    translator.detect(msg, (err, det) => {
      if (err) {
        console.log(err)
        return
      }
      // if (det.confidence > 0.6) {
        tts(user, msg, det.language)
        if (det.language !== "en") {
          translator.translate(msg, 'en').then((trans) => {
            console.log(trans)
            chat.say(chan, `(${det.language} -> en) ${user}: ${trans[0]}`)
            // tts(user, trans[0], 'en')
          })
        }
      // } else {
      //   console.log(`message from ${user} could not be understood: ${msg}`)
      // }
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
        <Form.Control type="text" placeholder="FlashcrySamurai" />
        <Form.Text className="text-muted">
            The bot will connect to this channel.
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBotID">
        <Form.Label>Bot Client ID</Form.Label>
        <Form.Control type="text" />
      </Form.Group>

      <Form.Group controlId="formBotAccessToken">
        <Form.Label>Bot Access Token</Form.Label>
        <Form.Control type="password" />
      </Form.Group>

      <Form.Group controlId="formGoogleProjectID">
        <Form.Label>Google Project ID</Form.Label>
        <Form.Control type="text" />
      </Form.Group>

      <Form.Group controlId="formGoogleMail">
        <Form.Label>Google Client Email</Form.Label>
        <Form.Control type="text" />
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
