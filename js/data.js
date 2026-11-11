// 게임 데이터: 일상에서 쉽게 볼 수 있는 물건과 그 속의 화학 물질
// model.smiles = 분자 연결 정보, model.type = 결정/금속 등 특수 모형
// 물건 항목: [이름, 이모지, [물질 id], [카메라 인식용 영어 문구]]
//   → 물건이나 문구를 바꾸면 tools/build-embeds.mjs 로 js/embeds.js 를 다시 만들어야 합니다.
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
  const CHAIN = '끝없이 이어지는 사슬의 일부만 나타냈어요. 점선 원은 사슬이 계속된다는 뜻이에요.';

  // ───── 주방
  sub('acetic', '아세트산', 'CH₃COOH', 'acid', '산', '식초의 신맛을 내는 물질이에요. 물에 녹으면 수소 이온을 조금 내놓는 약한 산입니다.', { smiles: 'CC(=O)O' });
  sub('nacl', '염화나트륨', 'NaCl', 'salt', '염 (이온 결합 물질)', '소금이에요. 나트륨 이온과 염화 이온이 번갈아 쌓여 정육면체 모양 결정을 만듭니다.', { type: 'rocksalt', a: 'Na', b: 'Cl' });
  sub('sucrose', '수크로스', 'C₁₂H₂₂O₁₁', 'organic', '유기물 (탄수화물)', '설탕의 주성분이에요. 포도당과 과당이 하나씩 결합한 탄수화물입니다.', { smiles: 'OCC1OC(OC2(CO)OC(CO)C(O)C2O)C(O)C(O)C1O' });
  sub('trigly', '트라이글리세라이드', '지방', 'organic', '유기물 (지질)', '식용유와 지방의 주성분이에요. 글리세롤 하나에 지방산 세 개가 붙은 모양입니다.', { smiles: 'CCCCCC(=O)OCC(OC(=O)CCCCC)COC(=O)CCCCC' }, '실제 지방산 사슬은 탄소가 16~18개로 더 길어요. 여기서는 짧게 줄여 나타냈어요.');
  sub('methane', '메테인', 'CH₄', 'organic', '탄화수소', '도시가스의 주성분이에요. 탄소 1개에 수소 4개가 붙은 가장 간단한 탄화수소입니다.', { smiles: 'C' });
  sub('propane', '프로페인', 'C₃H₈', 'organic', '탄화수소', 'LPG에 들어 있는 연료예요. 탄소 3개가 한 줄로 이어져 있습니다.', { smiles: 'CCC' });
  sub('butane', '뷰테인', 'C₄H₁₀', 'organic', '탄화수소', '휴대용 가스레인지의 부탄가스 연료예요. 탄소 4개가 이어진 탄화수소입니다.', { smiles: 'CCCC' });
  sub('las', '알킬벤젠설폰산나트륨', 'C₁₈H₂₉SO₃Na', 'organic', '계면활성제', '주방세제의 세정 성분이에요. 긴 꼬리는 기름과, 머리 부분은 물과 친해서 기름때를 떼어 냅니다.', { smiles: 'CCCCCCCCCCCCc1ccc(cc1)S(=O)(=O)[O-].[Na+]' });
  sub('rubber', '천연고무 (폴리아이소프렌)', '(C₅H₈)ₙ', 'polymer', '고분자', '고무장갑과 타이어의 재료예요. 사슬이 구불구불해서 늘렸다 놓으면 원래대로 돌아옵니다.', { smiles: '*CC(C)=CCCC(C)=CC*' }, CHAIN);
  sub('al', '알루미늄', 'Al', 'metal', '금속', '호일과 음료수 캔의 재료예요. 가볍고 얇게 잘 펴지는 금속입니다.', { type: 'metal', a: 'Al' });
  sub('pe', '폴리에틸렌', '(C₂H₄)ₙ', 'polymer', '고분자', '비닐봉지, 랩, 놀이터 미끄럼틀의 재료예요. 에틸렌 분자가 수천 개씩 길게 이어진 고분자입니다.', { smiles: '*CCCCCC*' }, CHAIN);
  sub('pp', '폴리프로필렌', '(C₃H₆)ₙ', 'polymer', '고분자', '반찬통과 플라스틱 의자의 재료예요. 가볍고 단단하며 열에 강한 고분자입니다.', { smiles: '*CC(C)CC(C)CC(C)*' }, CHAIN);
  sub('steel', '스테인리스강 (철·크로뮴 합금)', 'Fe + Cr', 'metal', '합금', '숟가락, 냄비, 가위의 재료예요. 철에 크로뮴을 섞어 녹이 잘 슬지 않게 만든 합금입니다.', { type: 'metal', a: 'Fe', b: 'Cr' });
  sub('sio2', '이산화규소', 'SiO₂', 'oxide', '산화물', '유리와 모래의 주성분이에요. 규소와 산소가 그물처럼 끝없이 이어져 있습니다.', { smiles: '*O[Si](O*)(O*)O[Si](O*)(O*)O*' }, '그물 구조의 일부만 나타냈어요. 점선 원은 구조가 계속된다는 뜻이에요.');

  // ───── 냉장고·식탁
  sub('pet', '페트 (폴리에틸렌 테레프탈레이트)', '(C₁₀H₈O₄)ₙ', 'polymer', '고분자', '생수병과 음료수병의 재료예요. 투명하고 가벼우며 재활용이 잘 됩니다.', { smiles: '*OCCOC(=O)c1ccc(cc1)C(=O)*' }, '반복되는 단위 하나만 나타냈어요.');
  sub('water', '물', 'H₂O', 'etc', '화합물', '산소 원자 1개와 수소 원자 2개가 결합한 물질이에요. 굽은 모양이라 다른 물질을 잘 녹입니다.', { smiles: 'O' });
  sub('co2', '이산화탄소', 'CO₂', 'oxide', '화합물', '탄산음료의 톡 쏘는 기포예요. 우리가 내쉬는 숨에도 들어 있고 식물이 광합성에 사용합니다.', { smiles: 'O=C=O' });
  sub('carbonic', '탄산', 'H₂CO₃', 'acid', '산', '이산화탄소가 물에 녹아 생기는 약한 산이에요. 탄산음료가 살짝 신 까닭입니다.', { smiles: 'OC(=O)O' });
  sub('caco3', '탄산칼슘', 'CaCO₃', 'salt', '염', '달걀 껍데기, 분필, 조개껍데기의 주성분이에요. 산을 만나면 이산화탄소 기체가 나옵니다.', { smiles: '[Ca+2].[O-]C(=O)[O-]' });
  sub('citric', '시트르산 (구연산)', 'C₆H₈O₇', 'acid', '산', '귤, 오렌지, 레몬의 신맛을 내는 산이에요.', { smiles: 'OC(=O)CC(O)(C(=O)O)CC(=O)O' });
  sub('vitc', '비타민 C (아스코르브산)', 'C₆H₈O₆', 'organic', '유기물 (비타민)', '과일과 채소에 많은 비타민이에요. 우리 몸이 스스로 만들지 못해 음식으로 먹어야 합니다.', { smiles: 'OCC(O)C1OC(=O)C(O)=C1O' });
  sub('lactose', '젖당 (락토스)', 'C₁₂H₂₂O₁₁', 'organic', '유기물 (탄수화물)', '우유에 들어 있는 당이에요. 포도당과 갈락토스가 하나씩 결합해 있습니다.', { smiles: 'OCC1OC(OC2C(CO)OC(O)C(O)C2O)C(O)C(O)C1O' });
  sub('caffeine', '카페인', 'C₈H₁₀N₄O₂', 'organic', '유기물', '커피, 차, 콜라에 들어 있어요. 졸음을 쫓지만 많이 먹으면 잠을 방해합니다.', { smiles: 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C' });
  sub('starch', '녹말', '(C₆H₁₀O₅)ₙ', 'polymer', '천연 고분자', '쌀, 빵, 감자의 주성분이에요. 포도당이 길게 이어진 것으로, 소화되면 다시 포도당이 됩니다.', { smiles: '*OC1C(O)C(O)C(OC2C(O)C(O)C(*)OC2CO)OC1CO' }, '포도당 단위 2개만 나타냈어요. 셀룰로스와 재료는 같지만 포도당이 이어지는 방향이 달라요.');

  // ───── 욕실
  sub('soap', '지방산나트륨', 'C₁₇H₃₅COONa', 'organic', '계면활성제 (염기성)', '비누의 주성분이에요. 긴 탄소 꼬리가 기름때에 달라붙어 물로 씻겨 나가게 합니다.', { smiles: 'CCCCCCCCCCCCCCCCCC(=O)[O-].[Na+]' });
  sub('naf', '플루오린화나트륨', 'NaF', 'salt', '염', '치약에 들어 있어요. 치아 표면을 단단하게 해서 충치를 막아 줍니다.', { type: 'rocksalt', a: 'Na', b: 'F' });
  sub('nylon', '나일론', '고분자', 'polymer', '고분자', '칫솔모와 스타킹의 재료예요. 질기고 탄력이 좋은 합성 섬유입니다.', { smiles: '*NCCCCCCNC(=O)CCCCC(=O)*' }, '반복되는 단위 하나만 나타냈어요.');
  sub('sles', '라우릴에테르황산나트륨', 'SLES', 'organic', '계면활성제', '샴푸의 거품을 만드는 성분이에요. 머리카락의 기름때를 물에 섞이게 합니다.', { smiles: 'CCCCCCCCCCCCOCCOCCOS(=O)(=O)[O-].[Na+]' });
  sub('hocl', '잔류 염소 (차아염소산)', 'HOCl', 'etc', '소독제', '수돗물을 소독하고 남은 아주 적은 양의 염소 성분이에요. 물속 세균이 다시 늘지 않게 합니다.', { smiles: 'OCl' });
  sub('naclo', '차아염소산나트륨', 'NaClO', 'salt', '산화제 (염기성)', '락스의 주성분이에요. 세균을 죽이고 얼룩의 색을 빼는 산화제입니다.', { smiles: '[Na+].[O-]Cl' });
  sub('cellulose', '셀룰로스', '(C₆H₁₀O₅)ₙ', 'polymer', '천연 고분자', '휴지, 종이, 나무의 주성분이에요. 포도당이 수천 개 이어져 식물을 단단하게 합니다.', { smiles: '*OC1C(O)C(O)C(OC2C(O)C(O)C(*)OC2CO)OC1CO' }, '포도당 단위 2개만 나타냈어요.');

  // ───── 거실·방
  sub('zn', '아연', 'Zn', 'metal', '금속', '건전지의 (−)극 재료예요. 전자를 내놓으며 전기를 만듭니다.', { type: 'metal', a: 'Zn' });
  sub('mno2', '이산화망가니즈', 'MnO₂', 'oxide', '산화물', '건전지의 (+)극 재료예요. 과산화수소를 빨리 분해하는 촉매로도 쓰입니다.', { smiles: 'O=[Mn]=O' }, '실제로는 수많은 원자가 이어진 결정이에요. 구성 비율만 보이도록 단순화했어요.');
  sub('koh', '수산화칼륨', 'KOH', 'base', '염기', '알칼리 건전지 속 전해질이에요. 물에 녹아 수산화 이온을 내놓는 강한 염기입니다.', { smiles: '[K+].[OH-]' });
  sub('cu', '구리', 'Cu', 'metal', '금속', '전선과 충전 케이블 속의 붉은 금속이에요. 전기가 아주 잘 통합니다.', { type: 'metal', a: 'Cu' });
  sub('coin', '백동 (구리·니켈 합금)', 'Cu + Ni', 'metal', '합금', '100원, 500원 동전의 재료예요. 구리에 니켈을 섞어 단단하고 은빛이 납니다.', { type: 'metal', a: 'Cu', b: 'Ni' });
  sub('ethanol', '에탄올', 'C₂H₅OH', 'organic', '유기물 (알코올)', '손 소독제와 마커 잉크의 용매로 쓰여요. 세균을 죽이고 빨리 증발합니다.', { smiles: 'CCO' });
  sub('zno', '산화아연', 'ZnO', 'oxide', '산화물', '선크림의 흰색 성분이에요. 자외선을 반사하고 흡수해 피부를 지킵니다.', { smiles: '[Zn]=O' }, '실제로는 결정 구조예요. 구성 비율만 보이도록 단순화했어요.');
  sub('tio2', '이산화타이타늄', 'TiO₂', 'oxide', '산화물', '선크림과 흰색 페인트에 쓰여요. 자외선을 잘 막아 줍니다.', { smiles: 'O=[Ti]=O' }, '실제로는 결정 구조예요. 구성 비율만 보이도록 단순화했어요.');

  // ───── 교실
  sub('caso4', '황산칼슘', 'CaSO₄', 'salt', '염', '분필과 석고의 성분이에요. 물에 잘 녹지 않는 흰색 고체입니다.', { smiles: '[Ca+2].[O-]S(=O)(=O)[O-]' });
  sub('graphite', '흑연', 'C', 'etc', '원소 (탄소 동소체)', '연필심의 재료예요. 탄소가 육각형 판 모양으로 층층이 쌓여 있어 종이에 잘 묻어납니다.', { type: 'graphite', layers: 2 });
  sub('pvc', '폴리염화비닐 (PVC)', '(C₂H₃Cl)ₙ', 'polymer', '고분자', '플라스틱 지우개와 수도관의 재료예요. 염소 원자가 붙어 있는 고분자입니다.', { smiles: '*CC(Cl)CC(Cl)CC(Cl)*' }, CHAIN);
  sub('pva', '폴리비닐알코올', '(C₂H₄O)ₙ', 'polymer', '고분자', '물풀과 딱풀의 끈적한 성분이에요. 물에 녹는 고분자라서 마르면 종이를 붙여 줍니다.', { smiles: '*CC(O)CC(O)CC(O)*' }, CHAIN);

  // ───── 복도·보건실·운동장
  sub('h2o2', '과산화수소', 'H₂O₂', 'oxide', '산화제', '상처에 바르면 거품을 내며 물과 산소로 분해돼요. 소독에 쓰입니다.', { smiles: 'OO' });
  sub('map', '인산이수소암모늄', 'NH₄H₂PO₄', 'salt', '염', '소화기 속 분말이에요. 불에 닿으면 녹아서 타는 물질을 덮어 산소를 막습니다.', { smiles: '[NH4+].OP(=O)(O)[O-]' });
  sub('pu', '폴리우레탄', '고분자', 'polymer', '고분자', '운동장 트랙의 재료예요. 탄성이 좋아 충격을 흡수합니다.', { smiles: '*OCCOC(=O)NCCCCCCNC(=O)*' }, '반복되는 단위 하나만 단순화해 나타냈어요.');
  sub('fe', '철', 'Fe', 'metal', '금속', '철봉, 축구 골대, 자전거의 재료예요. 단단하지만 물과 산소를 만나면 녹이 습니다.', { type: 'metal', a: 'Fe' });

  // ───── 공원 · 하늘·물·생물
  sub('n2', '질소', 'N₂', 'etc', '원소', '공기의 약 78%를 차지해요. 원자 2개가 삼중 결합으로 단단히 묶여 있어 반응을 잘 하지 않습니다.', { smiles: 'N#N' });
  sub('o2', '산소', 'O₂', 'etc', '원소', '공기의 약 21%를 차지해요. 우리가 숨 쉴 때와 물질이 탈 때 필요합니다.', { smiles: 'O=O' });
  sub('ar', '아르곤', 'Ar', 'etc', '원소', '공기 중에 약 0.9% 들어 있어요. 원자 하나로 존재하고 다른 물질과 반응하지 않습니다.', { smiles: '[Ar]' });
  sub('chlorophyll', '엽록소', 'C₅₅H₇₂MgN₄O₅', 'organic', '유기물', '잎을 초록색으로 보이게 하는 색소예요. 빛 에너지를 흡수해 광합성을 일으킵니다.', { smiles: 'C1=CC2=CC3=CC=C(N3[Mg]678)C=C4C=CC(=N46)C=C5C=CC(=N57)C=C1N28' }, '가운데에 마그네슘이 있는 중심 고리만 나타냈어요. 실제로는 긴 꼬리와 곁가지가 더 붙어 있어요.');
  sub('glucose', '포도당', 'C₆H₁₂O₆', 'organic', '유기물', '광합성으로 만들어지는 양분이에요. 생물이 에너지를 얻는 데 사용합니다.', { smiles: 'OCC1OC(O)C(O)C(O)C1O' });
  sub('lignin', '리그닌', '천연 고분자', 'polymer', '천연 고분자', '셀룰로스 사이를 채워 나무를 딱딱하게 만드는 물질이에요.', { smiles: 'COc1cc(C=CCO)ccc1O' }, '복잡한 그물 구조라서, 리그닌을 이루는 기본 단위 하나만 나타냈어요.');
  sub('anthocyanin', '안토시아닌', 'C₁₅H₁₁O₆⁺', 'organic', '유기 색소', '단풍의 붉은색을 내는 색소예요. 산성·염기성에 따라 색이 달라집니다.', { smiles: 'Oc1cc(O)c2cc(O)c([o+]c2c1)-c3ccc(O)c(O)c3' }, '안토시아닌의 한 종류인 사이아니딘의 골격이에요.');
  sub('carotene', '카로티노이드', 'C₄₀H₅₆', 'organic', '유기 색소', '단풍의 노란색·주황색을 내는 색소예요. 당근에도 많이 들어 있습니다.', { smiles: 'CC1=C(C(CCC1)(C)C)C=CC(=CC=CC(=CC=CC=C(C)C=CC=C(C)C=CC2=C(CCCC2(C)C)C)C)C' }, '카로티노이드의 한 종류인 베타카로틴이에요.');
  sub('formic', '폼산 (개미산)', 'HCOOH', 'acid', '산', '개미가 몸을 지킬 때 내뿜는 산이에요. 가장 간단한 유기산입니다.', { smiles: 'OC=O' });

  // ───── 공원 · 땅·시설물
  sub('rust', '산화철 (녹)', 'Fe₂O₃·xH₂O', 'oxide', '산화물 (산화 반응)', '철이 공기 중 산소, 물과 반응해 생긴 붉은 녹이에요.', { smiles: 'O=[Fe]O[Fe]=O' }, '실제로는 결정 구조예요. 철과 산소의 비율이 보이도록 단순화했어요.');
  sub('asphalt', '아스팔트 (탄화수소)', '탄화수소 혼합물', 'organic', '혼합물', '원유에서 얻는 검고 끈적한 물질이에요. 크고 무거운 탄화수소가 여러 종류 섞여 있습니다.', { smiles: 'CCCCCCCCc1ccc2ccccc2c1' }, '수많은 탄화수소 가운데 한 가지 예시예요.');
  sub('concrete', '규산칼슘', 'Ca₂SiO₄', 'salt', '혼합물 성분', '콘크리트 속 시멘트의 주성분이에요. 물과 반응해 돌처럼 굳습니다.', { smiles: '[Ca+2].[Ca+2].[O-][Si]([O-])([O-])[O-]' }, '시멘트의 여러 성분 가운데 대표적인 하나예요.');
  sub('octane', '옥테인', 'C₈H₁₈', 'organic', '탄화수소', '자동차 연료인 휘발유의 대표 성분이에요. 탄소 8개가 이어진 탄화수소입니다.', { smiles: 'CCCCCCCC' }, '휘발유는 여러 탄화수소의 혼합물이에요. 그 가운데 대표적인 하나를 나타냈어요.');

  // ───── 특별 카드 (안전 사례)
  sub('cl2', '염소 기체', 'Cl₂', 'etc', '⚠ 안전 카드', '락스(NaClO)를 식초나 산성 세제 같은 산성 물질과 섞으면 생기는 유독한 기체예요. 절대 함께 쓰면 안 됩니다!\n예) NaClO + 2HCl → NaCl + H₂O + Cl₂↑', { smiles: 'ClCl' });
  S.cl2.special = { need: ['naclo', 'acetic'], hint: '락스 속 물질과 식초 속 물질을 모두 모으면 열려요.', mix: '🧪 락스 + 🍶 식초·산성 세제' };

  const PLACES = [
    {
      id: 'home', name: '집', emoji: '🏠', color: '#fbbf24',
      zones: [
        { id: 'kitchen', name: '주방', emoji: '🍳', items: [
          ['식초', '🍶', ['acetic'], ['a bottle of vinegar', 'a vinegar bottle in a kitchen']],
          ['소금', '🧂', ['nacl'], ['a container of table salt', 'a salt shaker', 'a bag of salt']],
          ['설탕', '🍬', ['sucrose'], ['a bag of sugar', 'white sugar in a jar', 'sugar cubes']],
          ['식용유', '🫒', ['trigly'], ['a bottle of cooking oil', 'a bottle of vegetable oil']],
          ['가스레인지', '🔥', ['methane', 'propane', 'butane'], ['a gas stove', 'a gas burner with a blue flame', 'a butane gas canister']],
          ['주방세제', '🧴', ['las'], ['a bottle of dish soap', 'dishwashing liquid next to a kitchen sink']],
          ['고무장갑', '🧤', ['rubber'], ['rubber gloves', 'pink rubber dishwashing gloves']],
          ['알루미늄 호일', '🥡', ['al'], ['a roll of aluminum foil', 'a sheet of aluminium foil']],
          ['비닐봉지·랩', '🛍️', ['pe'], ['a plastic bag', 'a roll of plastic wrap']],
          ['반찬통', '🍱', ['pp'], ['a plastic food storage container', 'a plastic container with a lid']],
          ['숟가락·냄비', '🥄', ['steel'], ['a stainless steel spoon', 'a stainless steel cooking pot', 'metal chopsticks and a spoon']],
          ['유리컵', '🥛', ['sio2'], ['a drinking glass', 'an empty glass cup']] ] },
        { id: 'food', name: '냉장고·식탁', emoji: '🍽️', items: [
          ['생수병', '💧', ['pet', 'water'], ['a plastic bottle of water', 'a clear plastic water bottle']],
          ['탄산음료', '🥤', ['co2', 'carbonic'], ['a can of soda', 'a bottle of cola', 'a glass of fizzy soda']],
          ['달걀', '🥚', ['caco3'], ['eggs', 'an egg', 'a carton of eggs']],
          ['귤·오렌지', '🍊', ['citric', 'vitc'], ['a tangerine', 'an orange', 'mandarin oranges']],
          ['우유', '🥛', ['lactose'], ['a carton of milk', 'a glass of milk']],
          ['커피·차', '☕', ['caffeine'], ['a cup of coffee', 'a cup of tea', 'instant coffee sticks']],
          ['밥·빵', '🍚', ['starch'], ['a bowl of cooked rice', 'a loaf of bread', 'sliced bread']] ] },
        { id: 'bath', name: '욕실', emoji: '🛁', items: [
          ['비누', '🧼', ['soap'], ['a bar of soap', 'soap on a soap dish']],
          ['치약', '🦷', ['naf', 'caco3'], ['a tube of toothpaste', 'a toothpaste tube on a sink']],
          ['칫솔', '🪥', ['nylon'], ['a toothbrush', 'toothbrushes in a cup']],
          ['샴푸', '🧴', ['sles'], ['a bottle of shampoo', 'a shampoo pump bottle in a bathroom']],
          ['수돗물', '🚰', ['water', 'hocl'], ['water running from a faucet', 'a bathroom sink tap', 'a faucet']],
          ['락스', '🧪', ['naclo'], ['a bottle of bleach', 'a bottle of chlorine bleach cleaner']],
          ['휴지', '🧻', ['cellulose'], ['a roll of toilet paper', 'a box of tissues']] ] },
        { id: 'living', name: '거실·방', emoji: '🛋️', items: [
          ['건전지', '🔋', ['zn', 'mno2', 'koh'], ['an AA battery', 'alkaline batteries']],
          ['충전 케이블', '🔌', ['cu'], ['a phone charging cable', 'a USB cable', 'an electrical power cord']],
          ['동전', '🪙', ['coin'], ['coins', 'a pile of coins']],
          ['유리창', '🪟', ['sio2'], ['a glass window', 'a window pane']],
          ['손 소독제', '🧴', ['ethanol'], ['a bottle of hand sanitizer', 'a hand sanitizer pump bottle']],
          ['택배 상자', '📦', ['cellulose'], ['a cardboard box', 'a cardboard shipping box']],
          ['선크림', '🧴', ['zno', 'tio2'], ['a tube of sunscreen', 'a bottle of sunscreen lotion']] ] },
      ],
    },
    {
      id: 'school', name: '학교', emoji: '🏫', color: '#60a5fa',
      zones: [
        { id: 'class', name: '교실', emoji: '📚', items: [
          ['분필', '🖍️', ['caco3', 'caso4'], ['a piece of chalk', 'sticks of chalk', 'chalk on a blackboard ledge']],
          ['연필', '✏️', ['graphite'], ['a pencil', 'the sharpened tip of a pencil']],
          ['지우개', '🧽', ['pvc'], ['a rubber eraser', 'an eraser on a desk']],
          ['풀', '🧷', ['pva'], ['a glue stick', 'a bottle of school glue']],
          ['가위', '✂️', ['steel'], ['a pair of scissors', 'scissors']],
          ['책·공책', '📓', ['cellulose'], ['a book', 'an open notebook', 'a textbook']],
          ['화이트보드 마커', '🖊️', ['ethanol'], ['a whiteboard marker', 'a marker pen']],
          ['플라스틱 의자', '🪑', ['pp'], ['a plastic chair', 'a school chair']],
          ['유리창', '🪟', ['sio2'], ['a glass window', 'a classroom window']] ] },
        { id: 'yard', name: '복도·보건실·운동장', emoji: '⚽', items: [
          ['손 소독제', '🧴', ['ethanol'], ['a bottle of hand sanitizer', 'a hand sanitizer dispenser']],
          ['상처 소독약', '🩹', ['h2o2'], ['a bottle of hydrogen peroxide', 'a bottle of antiseptic for wounds', 'a first aid kit']],
          ['소화기', '🧯', ['map'], ['a fire extinguisher', 'a red fire extinguisher on a wall']],
          ['운동장 트랙', '🏃', ['pu'], ['a running track', 'a red athletics track on a school field']],
          ['철봉·골대', '🥅', ['fe'], ['a metal pull-up bar in a playground', 'a soccer goal', 'monkey bars']],
          ['운동장 모래', '🏖️', ['sio2'], ['sand', 'a sandy school playground', 'a sandbox']] ] },
      ],
    },
    {
      id: 'park', name: '공원', emoji: '🌳', color: '#4ade80',
      zones: [
        { id: 'nature', name: '하늘·물·생물', emoji: '🌿', items: [
          ['공기', '🌬️', ['n2', 'o2', 'ar', 'co2'], ['the sky', 'a blue sky with clouds', 'clouds in the sky', 'a clear blue sky']],
          ['연못·분수', '⛲', ['water'], ['a fountain', 'a pond in a park']],
          ['나뭇잎', '🍃', ['chlorophyll', 'glucose'], ['green leaves', 'a green leaf on a tree']],
          ['나무줄기', '🪵', ['cellulose', 'lignin'], ['a tree trunk', 'tree bark']],
          ['단풍', '🍁', ['anthocyanin', 'carotene'], ['red autumn leaves', 'yellow and orange fall foliage']],
          ['개미', '🐜', ['formic'], ['an ant', 'ants on the ground']] ] },
        { id: 'ground', name: '땅·시설물', emoji: '🪨', items: [
          ['모래·돌', '🏖️', ['sio2'], ['sand', 'a granite rock', 'pebbles and stones']],
          ['녹슨 철', '⛓️', ['rust'], ['rusty metal', 'a rusty iron fence']],
          ['산책로', '🛤️', ['asphalt', 'concrete'], ['an asphalt path', 'a concrete walkway in a park']],
          ['자전거', '🚲', ['fe', 'rubber'], ['a bicycle', 'a parked bicycle']],
          ['자동차', '🚗', ['octane'], ['a car', 'a parked car']],
          ['미끄럼틀', '🛝', ['pe'], ['a playground slide', 'a plastic playground']] ] },
      ],
    },
  ];

  // 발견 장소 목록(source) 만들기
  const SOURCES = [];
  PLACES.forEach(p => p.zones.forEach(z => {
    z.sources = [];
    z.items.forEach((it, i) => it[2].forEach(sid => {
      if (!S[sid]) throw new Error('없는 물질: ' + sid);
      const src = { key: p.id + '/' + z.id + '/' + i + '/' + sid, place: p, zone: z, item: it[0], emoji: it[1], itemIndex: i, sub: sid };
      SOURCES.push(src); z.sources.push(src);
    }));
  }));
  const ORDER = Object.keys(S);
  ORDER.forEach((id, i) => { S[id].no = i + 1; S[id].sources = SOURCES.filter(s => s.sub === id); });

  return { GROUPS, SUBS: S, ORDER, PLACES, SOURCES };
})();
