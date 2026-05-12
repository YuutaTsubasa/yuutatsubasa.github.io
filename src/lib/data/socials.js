export const SOCIALS = [
  {
    id: 'x',
    label: 'X / Twitter',
    handle: '@yuutatsubasa',
    url: 'https://yutaii.run/twitter',
    primary: true,
    iconPath: 'M18.244 2H21l-6.49 7.41L22 22h-6.781l-5.31-6.95L3.5 22H.745l6.94-7.93L0 2h6.91l4.83 6.39L18.244 2zm-2.378 18.05h1.86L7.21 3.86H5.27l10.596 16.19z'
  },
  {
    id: 'yt',
    label: 'YouTube',
    handle: '悠太翼 Yuuta Tsubasa',
    url: 'https://yutaii.run/youtube',
    primary: true,
    iconPath: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z'
  },
  {
    id: 'tw',
    label: 'Twitch',
    handle: 'yuutatsubasa',
    url: 'https://yutaii.run/twitch',
    primary: true,
    iconPath: 'M2.149 0L.537 4.119v16.836h5.731V24h3.224l3.045-3.045h4.657L23.463 14.91V0H2.149zm19.045 13.836l-3.582 3.582h-5.731l-3.045 3.045v-3.045H3.94V2.149h17.254v11.687zM14.926 5.642v6.448h2.149V5.642h-2.149zm-5.731 0v6.448h2.149V5.642H9.195z'
  }
];

export const PRIMARY_SOCIALS = SOCIALS.filter((s) => s.primary);
