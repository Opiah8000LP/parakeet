// Everything personal lives in this file. Edit freely, no other file needs touching.
//
// Privacy: write <REDACTED_7> anywhere in a text value and it shows as a black bar
// exactly 7 characters wide. The real text is never stored anywhere on the site.

window.DW = window.DW || {};

DW.config = {
  name: 'DWEEB',
  tagline: 'digital identity file',
  osName: 'DWEEB // OS',
  osUrl: 'https://example.com/',  // <-- link to your main website

  // images and icons. swap the files, or change the paths here
  assets: {
    favicon: 'assets/favicon.png',
    grain: 'assets/img/grain.png',
    portrait: '',  // e.g. 'assets/img/portrait.png'. leave empty for none
    icons: {
      play: 'assets/icons/play.png',
      pause: 'assets/icons/pause.png',
      prev: 'assets/icons/prev.png',
      next: 'assets/icons/next.png',
      volume: 'assets/icons/volume.png',
      mute: 'assets/icons/mute.png',
      playlist: 'assets/icons/playlist.png',
      close: 'assets/icons/close.png',
      arrow: 'assets/icons/arrow.png'
    }
  },

  // small lines under the name on the first screen
  caption: [
    'FILE NO. 001',
    'SUBJECT: <REDACTED_5>',
    'STATUS: ACTIVE'
  ],

  // the sections. each has a title and either text (paragraphs) or rows (label / value)
  sections: [
    {
      id: 'identity',
      title: 'Identity',
      text: [
        'Write who you are here. A few short, deliberate sentences.',
        'My name is <REDACTED_7>. Everything else is up to you.'
      ]
    },
    {
      id: 'background',
      title: 'Background',
      text: [
        'Write about where you come from, what you have done, what shaped you.'
      ]
    },
    {
      id: 'interests',
      title: 'Interests',
      list: ['Interest one', 'Interest two', 'Interest three', 'Interest four']
    },
    {
      id: 'details',
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

  // outbound links (shown at the bottom). label, url
  links: [
    ['DWEEB // OS', 'https://example.com/']
  ],

  footer: 'DWEEB. ALL RIGHTS RESERVED.',

  // music. put files in assets/music/ and list them here. lyrics are not needed.
  // volume starts at 0.6. autoplay is blocked by browsers, so play starts on click.
  player: {
    volume: 0.6,
    tracks: [
      // { title: 'Track name', artist: 'Artist', file: 'assets/music/track.mp3' }
    ]
  }
};
