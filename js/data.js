// 게임 데이터: 일상생활_화학물질_장소별.md 를 옮긴 것
// model.smiles = 분자 연결 정보, model.type = 결정/금속 등 특수 모형
window.GAME_DATA = (function () {
  const GROUPS = {
    acid: { name: '산', color: '#fb7185' },
    base: { name: '염기', color: '#60a5fa' },
    salt: { name: '염', color: '#c4b5fd' },
    oxide: { name: '산화물', color: '#fdba74' },
    metal: { name: '금속', color: '#cbd5e1' },
    organic: { name: '유기물', color: '#86efac' },
    polymer: { name: '고분자', color: '#f9a8d4' },
    etc: { name: '원소·기타', color: '#67e8f9' },
  };

  const S = {};
  function sub(id, name, formula, group, cls, desc, model, simple) {
    S[id] = { id, name, formula, group, cls, desc, model, simple: simple || '' };
  }

  // ───── 집 · 주방
  sub('acetic', '아세트산', 'CH₃COOH', 'acid', '산', '식초의 신맛을 내는 물질이에요. 물에 녹으면 수소 이온을 조금 내놓는 약한 산입니다.', { smiles: 'CC(=O)O' });
  sub('nahco3', '탄산수소나트륨', 'NaHCO₃', 'salt', '염 (약염기성)', '베이킹소다의 주성분이에요. 열을 받으면 이산화탄소가 나와 빵을 부풀립니다.', { smiles: '[Na+].OC(=O)[O-]' });
  sub('nacl', '염화나트륨', 'NaCl', 'salt', '염 (이온 결합 물질)', '소금이에요. 나트륨 이온과 염화 이온이 번갈아 쌓여 정육면체 모양 결정을 만듭니다.', { type: 'rocksalt', a: 'Na', b: 'Cl' });
  sub('sucrose', '수크로스', 'C₁₂H₂₂O₁₁', 'organic', '유기물 (탄수화물)', '설탕의 주성분이에요. 포도당과 과당이 하나씩 결합한 탄수화물입니다.', { smiles: 'OCC1OC(OC2(CO)OC(CO)C(O)C2O)C(O)C(O)C1O' });
  sub('trigly', '트라이글리세라이드', '지방', 'organic', '유기물 (지질)', '식용유와 지방의 주성분이에요. 글리세롤 하나에 지방산 세 개가 붙은 모양입니다.', { smiles: 'CCCCCC(=O)OCC(OC(=O)CCCCC)COC(=O)CCCCC' }, '실제 지방산 사슬은 탄소가 16~18개로 더 길어요. 여기서는 짧게 줄여 나타냈어요.');
  sub('methane', '메테인', 'CH₄', 'organic', '탄화수소', '도시가스의 주성분이에요. 탄소 1개에 수소 4개가 붙은 가장 간단한 탄화수소입니다.', { smiles: 'C' });
  sub('propane', '프로페인', 'C₃H₈', 'organic', '탄화수소', 'LPG에 들어 있는 연료예요. 탄소 3개가 한 줄로 이어져 있습니다.', { smiles: 'CCC' });
  sub('butane', '뷰테인', 'C₄H₁₀', 'organic', '탄화수소', '휴대용 가스레인지 연료예요. 탄소 4개가 이어진 탄화수소입니다.', { smiles: 'CCCC' });
  sub('las', '알킬벤젠설폰산나트륨', 'C₁₈H₂₉SO₃Na', 'organic', '계면활성제', '주방세제의 세정 성분이에요. 긴 꼬리는 기름과, 머리 부분은 물과 친해서 기름때를 떼어 냅니다.', { smiles: 'CCCCCCCCCCCCc1ccc(cc1)S(=O)(=O)[O-].[Na+]' });
  sub('pe', '폴리에틸렌', '(C₂H₄)ₙ', 'polymer', '고분자', '랩과 비닐봉지의 재료예요. 에틸렌 분자가 수천 개씩 길게 이어진 고분자입니다.', { smiles: '*CCCCCC*' }, '끝없이 이어지는 사슬의 일부만 나타냈어요. 점선 원은 사슬이 계속된다는 뜻이에요.');
  sub('al', '알루미늄', 'Al', 'metal', '금속', '호일의 재료예요. 가볍고 얇게 잘 펴지는 금속입니다.', { type: 'metal', a: 'Al' });

  // ───── 집 · 욕실
  sub('soap', '지방산나트륨', 'C₁₇H₃₅COONa', 'organic', '계면활성제 (염기성)', '비누의 주성분이에요. 긴 탄소 꼬리가 기름때에 달라붙어 물로 씻겨 나가게 합니다.', { smiles: 'CCCCCCCCCCCCCCCCCC(=O)[O-].[Na+]' });
  sub('naf', '플루오린화나트륨', 'NaF', 'salt', '염', '치약에 들어 있어요. 치아 표면을 단단하게 해서 충치를 막아 줍니다.', { type: 'rocksalt', a: 'Na', b: 'F' });
  sub('caco3', '탄산칼슘', 'CaCO₃', 'salt', '염', '분필, 석회암, 달걀 껍데기의 주성분이에요. 산을 만나면 이산화탄소 기체가 나옵니다.', { smiles: '[Ca+2].[O-]C(=O)[O-]' });
  sub('naclo', '차아염소산나트륨', 'NaClO', 'salt', '산화제 (염기성)', '락스의 주성분이에요. 세균을 죽이고 얼룩의 색을 빼는 산화제입니다.', { smiles: '[Na+].[O-]Cl' });
  sub('sles', '라우릴에테르황산나트륨', 'SLES', 'organic', '계면활성제', '샴푸의 거품을 만드는 성분이에요. 머리카락의 기름때를 물에 섞이게 합니다.', { smiles: 'CCCCCCCCCCCCOCCOCCOS(=O)(=O)[O-].[Na+]' });
  sub('water', '물', 'H₂O', 'etc', '화합물', '산소 원자 1개와 수소 원자 2개가 결합한 물질이에요. 굽은 모양이라 다른 물질을 잘 녹입니다.', { smiles: 'O' });
  sub('hocl', '잔류 염소 (차아염소산)', 'HOCl', 'etc', '소독제', '수돗물을 소독하고 남은 아주 적은 양의 염소 성분이에요. 물속 세균이 다시 늘지 않게 합니다.', { smiles: 'OCl' });

  // ───── 집 · 생활용품
  sub('zn', '아연', 'Zn', 'metal', '금속', '건전지의 (−)극 재료예요. 전자를 내놓으며 전기를 만듭니다.', { type: 'metal', a: 'Zn' });
  sub('mno2', '이산화망가니즈', 'MnO₂', 'oxide', '산화물', '건전지의 (+)극 재료예요. 과산화수소를 빨리 분해하는 촉매로도 쓰입니다.', { smiles: 'O=[Mn]=O' }, '실제로는 수많은 원자가 이어진 결정이에요. 구성 비율만 보이도록 단순화했어요.');
  sub('koh', '수산화칼륨', 'KOH', 'base', '염기', '알칼리 건전지 속 전해질이에요. 물에 녹아 수산화 이온을 내놓는 강한 염기입니다.', { smiles: '[K+].[OH-]' });
  sub('cacl2', '염화칼슘', 'CaCl₂', 'salt', '염 (흡습성)', '제습제의 주성분이에요. 공기 중 수분을 빨아들여 스스로 녹습니다.', { smiles: '[Ca+2].[Cl-].[Cl-]' });
  sub('sio2', '이산화규소', 'SiO₂', 'oxide', '산화물', '실리카겔, 유리, 모래의 주성분이에요. 규소와 산소가 그물처럼 끝없이 이어져 있습니다.', { smiles: '*O[Si](O*)(O*)O[Si](O*)(O*)O*' }, '그물 구조의 일부만 나타냈어요. 점선 원은 구조가 계속된다는 뜻이에요.');
  sub('fe', '철', 'Fe', 'metal', '금속 (발열 반응)', '손난로 속 철 가루예요. 산소와 반응해 녹슬면서 열을 냅니다.', { type: 'metal', a: 'Fe' });
  sub('naph', '나프탈렌', 'C₁₀H₈', 'organic', '유기물 (승화성)', '옷장 방충제예요. 고체에서 바로 기체로 변하는 승화가 일어납니다.', { smiles: 'c1ccc2ccccc2c1' });

  // ───── 학교 · 교실
  sub('caso4', '황산칼슘', 'CaSO₄', 'salt', '염', '분필과 석고의 성분이에요. 물에 잘 녹지 않는 흰색 고체입니다.', { smiles: '[Ca+2].[O-]S(=O)(=O)[O-]' });
  sub('graphite', '흑연', 'C', 'etc', '원소 (탄소 동소체)', '연필심의 재료예요. 탄소가 육각형 판 모양으로 층층이 쌓여 있어 종이에 잘 묻어납니다.', { type: 'graphite', layers: 2 });
  sub('pp', '폴리프로필렌', '(C₃H₆)ₙ', 'polymer', '고분자', '플라스틱 의자의 재료예요. 가볍고 단단하며 열에 강한 고분자입니다.', { smiles: '*CC(C)CC(C)CC(C)*' }, '끝없이 이어지는 사슬의 일부만 나타냈어요.');

  // ───── 학교 · 과학실
  sub('hcl', '염화수소', 'HCl', 'acid', '강산', '물에 녹인 것이 염산이에요. 수소 이온을 많이 내놓는 강한 산입니다.', { smiles: 'Cl' });
  sub('naoh', '수산화나트륨', 'NaOH', 'base', '강염기', '물에 녹아 수산화 이온을 많이 내놓는 강한 염기예요. 피부에 닿으면 미끈거립니다.', { smiles: '[Na+].[OH-]' });
  sub('ethanol', '에탄올', 'C₂H₅OH', 'organic', '유기물 (알코올)', '알코올램프 연료, 소독약, 마커 용매로 쓰여요. 불이 잘 붙고 빨리 증발합니다.', { smiles: 'CCO' });
  sub('phph', '페놀프탈레인', 'C₂₀H₁₄O₄', 'organic', '유기물 (지시약)', '염기성 용액에서만 붉은색으로 변하는 지시약이에요.', { smiles: 'O=C1OC(c2ccccc12)(c3ccc(O)cc3)c4ccc(O)cc4' });
  sub('btb', 'BTB (브로모티몰 블루)', 'C₂₇H₂₈Br₂O₅S', 'organic', '유기물 (지시약)', '산성에서 노란색, 중성에서 초록색, 염기성에서 파란색을 띠는 지시약이에요.', { smiles: 'CC1=C(C(=C(C=C1C2(C3=CC=CC=C3S(=O)(=O)O2)C4=CC(=C(C(=C4C)Br)O)C(C)C)C(C)C)O)Br' });
  sub('mg', '마그네슘', 'Mg', 'metal', '금속', '불을 붙이면 눈부신 흰빛을 내며 타는 금속이에요.', { type: 'metal', a: 'Mg' });
  sub('cuso4', '황산구리', 'CuSO₄·5H₂O', 'salt', '염 (수화물)', '물 분자를 품고 있는 푸른색 결정이에요. 가열해 물을 날리면 흰색으로 변합니다.', { smiles: '[Cu+2].[O-]S(=O)(=O)[O-].O.O.O.O.O' });
  sub('h2o2', '과산화수소', 'H₂O₂', 'oxide', '산화제', '상처에 바르면 거품을 내며 물과 산소로 분해돼요. 소독에 쓰입니다.', { smiles: 'OO' });

  // ───── 학교 · 보건실·급식실·체육관
  sub('msg', '글루탐산나트륨', 'MSG', 'salt', '유기산의 염', '감칠맛을 내는 조미료예요. 다시마에 많은 글루탐산의 나트륨염입니다.', { smiles: '[Na+].[O-]C(=O)CCC(N)C(=O)O' });
  sub('nh4no3', '질산암모늄', 'NH₄NO₃', 'salt', '염 (흡열 반응)', '냉찜질팩 속 물질이에요. 물에 녹을 때 주변의 열을 빼앗아 차가워집니다.', { smiles: '[NH4+].[O-][N+](=O)[O-]' });
  sub('mgco3', '탄산마그네슘', 'MgCO₃', 'salt', '염', '체조·클라이밍 초크의 성분이에요. 손의 땀을 흡수해 미끄러지지 않게 합니다.', { smiles: '[Mg+2].[O-]C(=O)[O-]' });
  sub('pu', '폴리우레탄', '고분자', 'polymer', '고분자', '운동장 트랙의 재료예요. 탄성이 좋아 충격을 흡수합니다.', { smiles: '*OCCOC(=O)NCCCCCCNC(=O)*' }, '반복되는 단위 하나만 단순화해 나타냈어요.');

  // ───── 공원 · 공기와 물
  sub('n2', '질소', 'N₂', 'etc', '원소', '공기의 약 78%를 차지해요. 원자 2개가 삼중 결합으로 단단히 묶여 있어 반응을 잘 하지 않습니다.', { smiles: 'N#N' });
  sub('o2', '산소', 'O₂', 'etc', '원소', '공기의 약 21%를 차지해요. 우리가 숨 쉴 때와 물질이 탈 때 필요합니다.', { smiles: 'O=O' });
  sub('ar', '아르곤', 'Ar', 'etc', '원소', '공기 중에 약 0.9% 들어 있어요. 원자 하나로 존재하고 다른 물질과 반응하지 않습니다.', { smiles: '[Ar]' });
  sub('co2', '이산화탄소', 'CO₂', 'oxide', '화합물', '우리가 내쉬는 숨에 들어 있고, 식물이 광합성에 사용해요. 일직선 모양 분자입니다.', { smiles: 'O=C=O' });
  sub('o3', '오존', 'O₃', 'etc', '원소 (산소 동소체)', '산소 원자 3개로 된 물질이에요. 높은 하늘에서는 자외선을 막아 주지만 땅 근처에서는 해롭습니다.', { smiles: '[O-][O+]=O' });
  sub('sulfate', '황산염 (황산 이온)', 'SO₄²⁻', 'salt', '혼합물 성분', '미세먼지의 주요 성분이에요. 연료가 탈 때 나온 황 성분이 공기 중에서 변해 생깁니다.', { smiles: '[O-]S(=O)(=O)[O-]' });
  sub('nitrate', '질산염 (질산 이온)', 'NO₃⁻', 'salt', '혼합물 성분', '미세먼지의 주요 성분이에요. 자동차 배기가스의 질소 산화물에서 만들어집니다.', { smiles: '[O-][N+](=O)[O-]' });
  sub('soot', '탄소 입자 (검댕)', 'C', 'etc', '혼합물 성분', '연료가 다 타지 못해 생긴 검은 탄소 알갱이예요. 미세먼지에 섞여 있습니다.', { type: 'graphite', layers: 1 }, '탄소 판 한 조각으로 단순화했어요.');

  // ───── 공원 · 식물과 생물
  sub('chlorophyll', '엽록소', 'C₅₅H₇₂MgN₄O₅', 'organic', '유기물', '잎을 초록색으로 보이게 하는 색소예요. 빛 에너지를 흡수해 광합성을 일으킵니다.', { smiles: 'C1=CC2=CC3=CC=C(N3[Mg]678)C=C4C=CC(=N46)C=C5C=CC(=N57)C=C1N28' }, '가운데에 마그네슘이 있는 중심 고리만 나타냈어요. 실제로는 긴 꼬리와 곁가지가 더 붙어 있어요.');
  sub('glucose', '포도당', 'C₆H₁₂O₆', 'organic', '유기물', '광합성으로 만들어지는 양분이에요. 생물이 에너지를 얻는 데 사용합니다.', { smiles: 'OCC1OC(O)C(O)C(O)C1O' });
  sub('cellulose', '셀룰로스', '(C₆H₁₀O₅)ₙ', 'polymer', '천연 고분자', '식물 세포벽의 주성분이에요. 포도당이 수천 개 이어져 나무를 단단하게 합니다.', { smiles: '*OC1C(O)C(O)C(OC2C(O)C(O)C(*)OC2CO)OC1CO' }, '포도당 단위 2개만 나타냈어요.');
  sub('lignin', '리그닌', '천연 고분자', 'polymer', '천연 고분자', '셀룰로스 사이를 채워 나무를 딱딱하게 만드는 물질이에요.', { smiles: 'COc1cc(C=CCO)ccc1O' }, '복잡한 그물 구조라서, 리그닌을 이루는 기본 단위 하나만 나타냈어요.');
  sub('anthocyanin', '안토시아닌', 'C₁₅H₁₁O₆⁺', 'organic', '유기 색소', '단풍의 붉은색을 내는 색소예요. 산성·염기성에 따라 색이 달라집니다.', { smiles: 'Oc1cc(O)c2cc(O)c([o+]c2c1)-c3ccc(O)c(O)c3' }, '안토시아닌의 한 종류인 사이아니딘의 골격이에요.');
  sub('carotene', '카로티노이드', 'C₄₀H₅₆', 'organic', '유기 색소', '단풍의 노란색·주황색을 내는 색소예요. 당근에도 많이 들어 있습니다.', { smiles: 'CC1=C(C(CCC1)(C)C)C=CC(=CC=CC(=CC=CC=C(C)C=CC=C(C)C=CC2=C(CCCC2(C)C)C)C)C' }, '카로티노이드의 한 종류인 베타카로틴이에요.');
  sub('formic', '폼산 (개미산)', 'HCOOH', 'acid', '산', '개미가 몸을 지킬 때 내뿜는 산이에요. 가장 간단한 유기산입니다.', { smiles: 'OC=O' });

  // ───── 공원 · 땅과 시설물
  sub('rust', '산화철 (녹)', 'Fe₂O₃·xH₂O', 'oxide', '산화물 (산화 반응)', '철이 공기 중 산소, 물과 반응해 생긴 붉은 녹이에요.', { smiles: 'O=[Fe]O[Fe]=O' }, '실제로는 결정 구조예요. 철과 산소의 비율이 보이도록 단순화했어요.');
  sub('bronze', '청동 (구리·주석 합금)', 'Cu + Sn', 'metal', '합금', '구리에 주석을 섞어 만든 합금이에요. 순수한 구리보다 단단해서 동상에 쓰입니다.', { type: 'metal', a: 'Cu', b: 'Sn' });
  sub('patina', '녹청 (염기성 탄산구리)', 'Cu₂(OH)₂CO₃', 'salt', '염', '청동 동상 표면에 생기는 푸른 녹이에요. 속의 금속이 더 상하지 않게 막아 줍니다.', { smiles: '[Cu+2].[Cu+2].[OH-].[OH-].[O-]C(=O)[O-]' });
  sub('asphalt', '아스팔트 (탄화수소)', '탄화수소 혼합물', 'organic', '혼합물', '원유에서 얻는 검고 끈적한 물질이에요. 크고 무거운 탄화수소가 여러 종류 섞여 있습니다.', { smiles: 'CCCCCCCCc1ccc2ccccc2c1' }, '수많은 탄화수소 가운데 한 가지 예시예요.');
  sub('concrete', '규산칼슘', 'Ca₂SiO₄', 'salt', '혼합물 성분', '콘크리트 속 시멘트의 주성분이에요. 물과 반응해 돌처럼 굳습니다.', { smiles: '[Ca+2].[Ca+2].[O-][Si]([O-])([O-])[O-]' }, '시멘트의 여러 성분 가운데 대표적인 하나예요.');
  sub('urea', '요소', 'CO(NH₂)₂', 'organic', '유기물', '질소가 많이 들어 있어 비료로 쓰여요. 잔디의 잎을 푸르게 자라게 합니다.', { smiles: 'NC(=O)N' });
  sub('zno', '산화아연', 'ZnO', 'oxide', '산화물', '선크림의 흰색 성분이에요. 자외선을 반사하고 흡수해 피부를 지킵니다.', { smiles: '[Zn]=O' }, '실제로는 결정 구조예요. 구성 비율만 보이도록 단순화했어요.');
  sub('tio2', '이산화타이타늄', 'TiO₂', 'oxide', '산화물', '선크림과 흰색 페인트에 쓰여요. 자외선을 잘 막아 줍니다.', { smiles: 'O=[Ti]=O' }, '실제로는 결정 구조예요. 구성 비율만 보이도록 단순화했어요.');
  sub('deet', '디에틸톨루아마이드', 'DEET', 'organic', '유기물', '모기 기피제의 성분이에요. 모기가 사람 냄새를 맡지 못하게 방해합니다.', { smiles: 'CCN(CC)C(=O)c1cccc(C)c1' });

  // ───── 특별 카드 (안전 사례)
  sub('cl2', '염소 기체', 'Cl₂', 'etc', '⚠ 안전 카드', '락스(NaClO)와 산성 세제(HCl)를 섞으면 생기는 유독한 기체예요. 두 가지는 절대 함께 쓰면 안 됩니다!\nNaClO + 2HCl → NaCl + H₂O + Cl₂↑', { smiles: 'ClCl' });
  S.cl2.special = { need: ['naclo', 'hcl'], hint: '락스 속 물질과 염산 속 물질을 모두 모으면 열려요.' };

  const PLACES = [
    {
      id: 'home', name: '집', emoji: '🏠', color: '#fbbf24',
      zones: [
        { id: 'kitchen', name: '주방', emoji: '🍳', items: [
          ['식초', '🍶', ['acetic']], ['베이킹소다', '🧁', ['nahco3']], ['소금', '🧂', ['nacl']], ['설탕', '🍬', ['sucrose']],
          ['식용유', '🫒', ['trigly']], ['가스레인지 연료', '🔥', ['methane', 'propane', 'butane']], ['주방세제', '🧴', ['las']],
          ['랩', '🎞️', ['pe']], ['호일', '🥡', ['al']] ] },
        { id: 'bath', name: '욕실', emoji: '🛁', items: [
          ['비누', '🧼', ['soap']], ['치약', '🪥', ['naf', 'caco3']], ['락스', '🧪', ['naclo']], ['샴푸', '🧴', ['sles']], ['수돗물', '🚰', ['water', 'hocl']] ] },
        { id: 'living', name: '생활용품', emoji: '🧺', items: [
          ['알칼리 건전지', '🔋', ['zn', 'mno2', 'koh']], ['제습제', '💧', ['cacl2']], ['김 봉지 방습제', '🍙', ['sio2']], ['손난로', '♨️', ['fe']], ['옷장 방충제', '👕', ['naph']] ] },
      ],
    },
    {
      id: 'school', name: '학교', emoji: '🏫', color: '#60a5fa',
      zones: [
        { id: 'class', name: '교실', emoji: '📚', items: [
          ['분필', '🖍️', ['caco3', 'caso4']], ['연필심', '✏️', ['graphite']], ['유리창', '🪟', ['sio2']], ['화이트보드 마커', '🖊️', ['ethanol']], ['플라스틱 의자', '🪑', ['pp']] ] },
        { id: 'lab', name: '과학실', emoji: '🔬', items: [
          ['묽은 염산', '🧪', ['hcl']], ['수산화나트륨 용액', '⚗️', ['naoh']], ['알코올램프 연료', '🔥', ['ethanol']], ['지시약', '🌈', ['phph', 'btb']],
          ['마그네슘 리본', '🎀', ['mg']], ['황산구리', '💎', ['cuso4']], ['과산화수소수', '🫧', ['h2o2']] ] },
        { id: 'etc', name: '보건실·급식실·체육관', emoji: '🏐', items: [
          ['상처 소독약', '🩹', ['ethanol', 'h2o2']], ['조미료', '🍜', ['msg']], ['냉찜질팩', '🧊', ['nh4no3']], ['체조·클라이밍 초크', '🧗', ['mgco3']], ['운동장 트랙', '🏃', ['pu']] ] },
      ],
    },
    {
      id: 'park', name: '공원', emoji: '🌳', color: '#4ade80',
      zones: [
        { id: 'air', name: '공기와 물', emoji: '💨', items: [
          ['공기', '🌬️', ['n2', 'o2', 'ar', 'co2']], ['여름철 대기', '☀️', ['o3']], ['미세먼지', '🌫️', ['sulfate', 'nitrate', 'soot']], ['분수·연못', '⛲', ['water']] ] },
        { id: 'life', name: '식물과 생물', emoji: '🌿', items: [
          ['나뭇잎', '🍃', ['chlorophyll', 'glucose']], ['나무줄기', '🪵', ['cellulose', 'lignin']], ['단풍', '🍁', ['anthocyanin', 'carotene']], ['개미', '🐜', ['formic']] ] },
        { id: 'ground', name: '땅과 시설물', emoji: '🪨', items: [
          ['석회암·대리석', '🏛️', ['caco3']], ['모래·화강암', '🏖️', ['sio2']], ['철제 벤치의 녹', '🪑', ['rust']], ['청동 동상', '🗿', ['bronze', 'patina']],
          ['산책로', '🛤️', ['asphalt', 'concrete']], ['잔디 비료', '🌱', ['urea']], ['선크림', '🧴', ['zno', 'tio2']], ['모기 기피제', '🦟', ['deet']] ] },
      ],
    },
  ];

  // 발견 장소 목록(source) 만들기
  const SOURCES = [];
  PLACES.forEach(p => p.zones.forEach(z => {
    z.sources = [];
    z.items.forEach((it, i) => it[2].forEach(sid => {
      const src = { key: p.id + '/' + z.id + '/' + i + '/' + sid, place: p, zone: z, item: it[0], emoji: it[1], itemIndex: i, sub: sid };
      SOURCES.push(src); z.sources.push(src);
    }));
  }));
  const ORDER = Object.keys(S);
  ORDER.forEach((id, i) => { S[id].no = i + 1; S[id].sources = SOURCES.filter(s => s.sub === id); });

  return { GROUPS, SUBS: S, ORDER, PLACES, SOURCES };
})();
