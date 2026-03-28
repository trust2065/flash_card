export interface Character {
  char: string
  zhuyin: string
  pinyin: string
  example: string
  meaning: string
}

export const lesson1: Character[] = [
  { char: '拍', zhuyin: 'ㄆㄞ', pinyin: 'pāi', example: '拍手', meaning: '用手掌輕打' },
  { char: '手', zhuyin: 'ㄕㄡˇ', pinyin: 'shǒu', example: '右手', meaning: '人體的上肢' },
  { char: '左', zhuyin: 'ㄗㄨㄛˇ', pinyin: 'zuǒ', example: '左手', meaning: '方向，與右相對' },
  { char: '右', zhuyin: 'ㄧㄡˋ', pinyin: 'yòu', example: '右手', meaning: '方向，與左相對' },
  { char: '你', zhuyin: 'ㄋㄧˇ', pinyin: 'nǐ', example: '你好', meaning: '第二人稱' },
  { char: '他', zhuyin: 'ㄊㄚ', pinyin: 'tā', example: '他們', meaning: '第三人稱' },
  { char: '也', zhuyin: 'ㄧㄝˇ', pinyin: 'yě', example: '也好', meaning: '同樣、也是' },
  { char: '上', zhuyin: 'ㄕㄤˋ', pinyin: 'shàng', example: '上面', meaning: '與下相對' },
  { char: '下', zhuyin: 'ㄒㄧㄚˋ', pinyin: 'xià', example: '下面', meaning: '與上相對' },
  { char: '拍手', zhuyin: 'ㄆㄞ ㄕㄡˇ', pinyin: 'pāi shǒu', example: '大家拍手', meaning: '用兩手互擊' },
]
