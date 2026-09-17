/* =========================================================================
 * 🚀 응용 예제(실전 데모) 등록부
 * apps/*.js 에서 APPS.add({...}) 로 데모를 등록합니다. 형식은 docs/APPS_GUIDE.md 참고.
 * ========================================================================= */
(function (root) {
  const APPS = {
    categories: [
      { id: 'dnn', icon: '🤖', title: '딥러닝 (DNN)', desc: 'YOLO 객체 인식, 얼굴 검출, 사람 분할, 글자 검출 — 학습된 신경망 모델을 OpenCV DNN 으로 실행합니다.' },
      { id: 'vision', icon: '🏙️', title: '실무 영상 분석', desc: '물류 · 보안 · 교통 · 로봇 현장에서 쓰이는 영상 분석 기술입니다.' },
      { id: 'inspection', icon: '🏭', title: '머신비전 외관검사', desc: '제조 라인에서 제품의 결함 · 치수 · 누락을 자동으로 판정하는 검사 예제입니다.' },
    ],
    list: [],
    byId: {},
    add(...items) {
      for (const a of items) {
        if (this.byId[a.id]) { console.warn('중복 데모 id', a.id); continue; }
        this.list.push(a);
        this.byId[a.id] = a;
      }
    },
  };
  root.APPS = APPS;
  if (typeof module !== 'undefined') module.exports = APPS;
})(typeof window !== 'undefined' ? window : globalThis);
