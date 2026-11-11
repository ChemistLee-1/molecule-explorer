// js/data.js 의 물건별 인식 문구와 tools/negatives.json 을 CLIP 텍스트 임베딩으로 바꿔 js/embeds.js 를 만듭니다.
// 사용법: @huggingface/transformers 가 설치된 폴더에서
//   node build-embeds.mjs <게임 폴더 경로>
import { AutoTokenizer, CLIPTextModelWithProjection } from '@huggingface/transformers';
import fs from 'node:fs';

const MODEL = 'Xenova/clip-vit-base-patch32';
const root = process.argv[2];
const outPath = root + '/js/embeds.js';
const win = {};
new Function('window', fs.readFileSync(root + '/js/data.js', 'utf8'))(win);
const cfg = { items: {}, negatives: JSON.parse(fs.readFileSync(root + '/tools/negatives.json', 'utf8')).negatives };
win.GAME_DATA.PLACES.forEach(p => p.zones.forEach(z => z.items.forEach((it, i) => { cfg.items[p.id + '/' + z.id + '/' + i] = it[3]; })));

const tokenizer = await AutoTokenizer.from_pretrained(MODEL);
const model = await CLIPTextModelWithProjection.from_pretrained(MODEL, { dtype: 'fp32' });

async function embed(texts) {
  const inputs = tokenizer(texts.map(t => 'a photo of ' + t), { padding: 'max_length', truncation: true });
  const { text_embeds } = await model(inputs);
  const dim = text_embeds.dims[1], out = [];
  for (let i = 0; i < texts.length; i++) {
    const v = Float32Array.from(text_embeds.data.slice(i * dim, (i + 1) * dim));
    let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n);
    out.push(v.map(x => x / n));
  }
  return out;
}
// 용량을 줄이려고 값마다 8비트로 저장(방향만 중요하므로 읽을 때 다시 길이를 1로 맞춤)
const b64 = v => {
  let mx = 0; for (const x of v) mx = Math.max(mx, Math.abs(x));
  return Buffer.from(Int8Array.from(v, x => Math.round((x / mx) * 127)).buffer).toString('base64');
};

const items = {};
for (const [key, prompts] of Object.entries(cfg.items)) {
  items[key] = (await embed(prompts)).map(b64); // 문구별로 따로 저장(가장 잘 맞는 문구 사용)
}
const negatives = (await embed(cfg.negatives)).map(b64);
const js = '// 자동 생성 파일 (tools/build-embeds.mjs). 직접 고치지 마세요.\nwindow.CLIP_EMBEDS = ' +
  JSON.stringify({ model: MODEL, dim: 512, items, negatives }) + ';\n';
fs.writeFileSync(outPath, js);
console.log('items', Object.keys(items).length, 'negatives', negatives.length, 'bytes', js.length);
