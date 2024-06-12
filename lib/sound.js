// utils/sound.js
import { Howl } from 'howler';

const sound = new Howl({
  src: ['/doorbell.mp3']
});

export function SoundCall() {
  sound.play();
}
