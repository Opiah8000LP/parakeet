// Everything personal lives in this file. Edit freely, no other file needs touching.
//
// Privacy: write <REDACTED_7> anywhere in a text value and it shows as a black bar
// exactly 7 characters wide. The real text is never stored anywhere on the site.

window.DW = window.DW || {};

DW.config = {
  name: 'DWEEB',
  osUrl: 'https://example.com/',  // <-- your main website

  // images and icons. swap the files, or change the paths here
  assets: {
    favicon: 'assets/favicon.png',
    grain: 'assets/img/grain.png',
    icons: {
      play: 'assets/icons/play.png',
      pause: 'assets/icons/pause.png',
      prev: 'assets/icons/prev.png',
      next: 'assets/icons/next.png',
      volume: 'assets/icons/volume.png',
      mute: 'assets/icons/mute.png',
      playlist: 'assets/icons/playlist.png',
      close: 'assets/icons/close.png',
      arrow: 'assets/icons/arrow.png',
      min: 'assets/icons/min.png',
      max: 'assets/icons/max.png'
    }
  },

  // small lines under the name on the first screen
  caption: [
    'SUBJECT: <REDACTED_5>',
    'STATUS: STILL HERE',
    'FILE IS INCOMPLETE'
  ],

  // the sections. each has a title and text, a list, or rows (label / value)
  sections: [
    {
      title: 'Identity',
      text: [
        'Write who you are here. Few words. Let the rest be implied.',
        'My name is <REDACTED_7>. You were not meant to read that.'
      ]
    },
    {
      title: 'Background',
      text: [
        'Where you come from, what you did, what it cost. Write it plain.'
      ]
    },
    {
      title: 'Interests',
      list: ['Interest one', 'Interest two', 'Interest three', 'Interest four']
    },
    {
      title: 'Details',
      rows: [
        ['Alias', 'Dweeb'],
        ['Real name', '<REDACTED_12>'],
        ['Born', '<REDACTED_4>'],
        ['Location', '<REDACTED_9>'],
        ['Languages', 'English']
      ]
    }
  ],

  // outbound links at the bottom: label, url
  links: [
    ['DWEEB // OS', 'https://example.com/']
  ],

  footer: 'NOBODY READS THIS FAR. YOU DID.',

  player: {
    volume: 0.6,

    // just write the file name, like '1.mp3'. the player looks for it in these folders,
    // in order ('' is the main folder). the cover is the same name with .png/.jpg/.webp
    // sitting next to it: 1.mp3 + 1.png. add your own folders to the list if you like.
    // (a name with a slash in it, like 'stuff/1.mp3', is used exactly as written)
    folders: ['', 'music/', 'assets/music/', 'assets/', 'audio/', 'assets/audio/', 'songs/', 'media/'],
    coverTypes: ['png', 'jpg', 'jpeg', 'webp'],

    // title and artist are optional. no title = the file name
    tracks: [
      { file: '1.mp3', title: 'worry - Slowed', artist: 'LONOWN, riserayss' }
      // '1.mp3',
      // { file: '2.mp3', title: 'Track name', artist: 'Artist' }
    ]
  }
};
