// 角色版本歷史。資料來源：原始 /about 頁。
// image 指向 static/images/about/ 下既有的 webp 檔。
export const VERSIONS = [
  {
    id: 'v1',
    version: '1.0 & 1.5',
    short: '1·1.5',
    type: 'Live2D / 3D',
    credits: [
      { role: '繪師',          name: '猫島羽依',   url: 'https://x.com/nekosimayui' },
      { role: 'Live2D 模型師', name: '夜颯',       url: 'https://x.com/Yasa_661266' },
      { role: '3D 模型師',     name: 'がいらく',   url: 'https://x.com/Gairaku_tw' }
    ],
    image: '/images/about/1.0-01.webp',
    gallery: [
      '/images/about/1.0-01.webp',
      '/images/about/1.0-02.webp',
      '/images/about/1.0-03.webp',
      '/images/about/1.5-01.webp',
      '/images/about/1.5-02.webp'
    ],
    youtube: ['https://www.youtube.com/watch?v=wgEHJeHnTBU', 'https://www.youtube.com/watch?v=hDWDaYSErGU']
  },
  {
    id: 'v2',
    version: '2.0',
    short: '2.0',
    type: 'Live2D / 3D',
    credits: [
      { role: '繪師',      name: 'CC', url: 'https://x.com/etcelebi' },
      { role: '3D 模型師', name: '策策', url: 'https://x.com/COOKRICE6' }
    ],
    image: '/images/about/2.0-01.webp',
    gallery: ['/images/about/2.0-01.webp', '/images/about/2.0-02.webp']
  },
  {
    id: 'v3',
    version: '3.0',
    short: '3.0',
    type: 'Live2D / 3D',
    credits: [
      { role: '繪師',          name: '飛密', url: 'https://x.com/hikoumitsu' },
      { role: 'Live2D 模型師', name: '宗茶', url: 'https://x.com/mat_cha_m' },
      { role: '3D 模型師',     name: '策策', url: 'https://x.com/COOKRICE6' }
    ],
    image: '/images/about/3.0-01.webp',
    gallery: ['/images/about/3.0-01.webp', '/images/about/3.0-02.webp'],
    youtube: ['https://www.youtube.com/watch?v=q8UvhFnRJM8']
  },
  {
    id: 'v4',
    version: '4.0',
    short: '4.0',
    type: 'Live2D / 3D',
    credits: [
      { role: '繪師',      name: 'CC',   url: 'https://x.com/etcelebi' },
      { role: '3D 模型師', name: '策策', url: 'https://x.com/COOKRICE6', note: '包含 1.0 / 2.0 / 3.0 版本衣服更換' }
    ],
    image: '/images/about/4.0-01.webp',
    gallery: [
      '/images/about/4.0-01.webp',
      '/images/about/4.0-02.webp',
      '/images/about/4.0-03.webp',
      '/images/about/4.0-04.webp',
      '/images/about/4.0-05.webp',
      '/images/about/4.0-06.webp',
      '/images/about/4.0-07.webp'
    ]
  }
];
