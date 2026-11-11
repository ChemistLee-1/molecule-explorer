// 이미지 인식 워커: 카메라 화면을 CLIP 이미지 임베딩으로 바꿉니다. 사진은 기기 밖으로 나가지 않습니다.
import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2';

const MODEL = 'Xenova/clip-vit-base-patch32';
let processor = null, model = null;

self.onmessage = async e => {
  const m = e.data;
  try {
    if (m.type === 'init') {
      const files = {};
      const progress = p => {
        if (p.status !== 'progress' || !p.total) return;
        files[p.file] = [p.loaded, p.total];
        let a = 0, b = 0;
        for (const k in files) { a += files[k][0]; b += files[k][1]; }
        self.postMessage({ type: 'progress', pct: Math.round((a / b) * 100) });
      };
      processor = await AutoProcessor.from_pretrained(MODEL);
      model = await CLIPVisionModelWithProjection.from_pretrained(MODEL, { dtype: 'q8', progress_callback: progress });
      self.postMessage({ type: 'ready' });
    } else if (m.type === 'embed') {
      const img = new RawImage(new Uint8ClampedArray(m.data), m.w, m.h, 4).rgb();
      const inputs = await processor(img);
      const { image_embeds } = await model(inputs);
      const v = Float32Array.from(image_embeds.data);
      let n = 0;
      for (let i = 0; i < v.length; i++) n += v[i] * v[i];
      n = Math.sqrt(n) || 1;
      for (let i = 0; i < v.length; i++) v[i] /= n;
      self.postMessage({ type: 'embed', id: m.id, vec: v.buffer }, [v.buffer]);
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: m.id, message: String((err && err.message) || err) });
  }
};
