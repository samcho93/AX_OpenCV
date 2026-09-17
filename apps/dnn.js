/* 🤖 딥러닝(DNN) 응용 예제 — docs/APPS_GUIDE.md 참고 */
APPS.add(
  /* ------------------------------------------------------------------ YOLO */
  {
    id: 'yolo',
    cat: 'dnn',
    icon: '🚗',
    title: 'YOLO 실시간 객체 인식',
    subtitle: '사람 · 자동차 · 신호등 · 동물 등 80가지 물체를 찾아 이름표 붙이기',
    summary: `<p><b>YOLO(You Only Look Once)</b>는 이미지를 한 번만 보고 “어디에 · 무엇이” 있는지를 동시에 알아내는 대표적인 딥러닝 객체 인식 모델입니다.
      이 데모는 YOLO 계열의 <b>YOLOX</b>(Megvii, Apache-2.0) 모델을 OpenCV <code>dnn</code> 모듈로 실행해 COCO 데이터셋의 80가지 물체를 인식합니다.</p>
      <p>강좌에서 배운 크기 조절 · 그리기 함수가 딥러닝 모델의 <b>전처리와 결과 표시</b>에 그대로 쓰이는 것을 확인해 보세요.</p>`,
    uses: [
      ['자율주행 · ADAS', '카메라 영상에서 차량 · 보행자 · 신호등 · 표지판을 인식해 브레이크와 경고에 활용'],
      ['스마트시티 · 교통', '교차로 CCTV로 차종별 통행량을 세고 불법 주정차를 감지'],
      ['리테일 · 무인 매장', '진열대의 상품 결품 확인, 매장 내 고객 동선 분석'],
      ['스마트팩토리 안전', '작업자의 안전모 · 조끼 착용 여부, 위험 구역 접근을 실시간 감시'],
      ['드론 · 농업 · 물류', '항공 영상의 차량 · 가축 수 세기, 창고의 박스 · 지게차 추적'],
    ],
    steps: [
      '입력 프레임을 비율을 유지한 채 <code>416×416</code> 정사각형에 맞추고 빈 곳은 회색(114)으로 채움',
      '<code>cv.dnn.blobFromImage</code> 로 신경망 입력(N·C·H·W) 형태로 변환',
      '<code>net.forward()</code> — 3,549개 위치마다 [중심 x, y, 폭, 높이, 물체일 확률, 80개 클래스 확률]을 예측',
      '격자 좌표와 스트라이드(8·16·32)로 상자 위치를 원래 이미지 좌표로 복원',
      '신뢰도(물체 확률 × 클래스 확률)가 기준보다 낮은 후보 제거',
      '<code>cv.dnn.NMSBoxes</code> 로 같은 물체에 겹친 상자들 중 가장 좋은 하나만 남기기 (비최대 억제)',
      '상자 · 이름 · 신뢰도를 그리고 클래스별 개수를 집계',
    ],
    tech: ['cv.dnn.readNetFromONNX', 'cv.dnn.blobFromImage', 'net.forward', 'cv.dnn.NMSBoxes', 'cv.resize', 'cv.rectangle', 'cv.putText'],
    controls: [
      ['model', '0 = YOLOX-nano (3.5MB, 빠름) · 1 = YOLOX-tiny (20MB, 더 정확하지만 약 5배 느림)'],
      ['confidence', '이 값(%) 이상인 물체만 표시. 낮추면 더 많이 찾지만 오탐이 늘어남'],
    ],
    inputs: ['street.png', 'dog416.png', 'messi5.jpg', 'video:vtest.mp4', 'video:cup.mp4', 'camera'],
    assets: ['street.png', 'dog416.png', 'yolox_nano.onnx', 'yolox_tiny.onnx'],
    note: '브라우저(WebAssembly, CPU 1코어)에서는 YOLOX-nano 가 한 장에 약 0.4초로 동영상 · 웹캠이 뚝뚝 끊겨 보입니다. 같은 모델이 PC의 CPU에서는 수십 FPS, GPU에서는 수백 FPS로 동작합니다.',
    refs: [
      ['YOLOX (Megvii-BaseDetection)', 'https://github.com/Megvii-BaseDetection/YOLOX'],
      ['OpenCV Zoo — object_detection_yolox', 'https://github.com/opencv/opencv_zoo/tree/main/models/object_detection_yolox'],
      ['OpenCV: Deep Neural Network module', 'https://docs.opencv.org/4.x/d2/d58/tutorial_table_of_content_dnn.html'],
    ],
    code: String.raw`
import cv2 as cv
import numpy as np
import time

CLASSES = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
    'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant',
    'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard',
    'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli',
    'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
    'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush']
MODELS = [('YOLOX-nano', 'yolox_nano.onnx'), ('YOLOX-tiny', 'yolox_tiny.onnx')]
SIZE = 416
_nets = {}


def get_net(i):
    name = MODELS[i][1]
    if name not in _nets:
        _nets[name] = cv.dnn.readNetFromONNX(name)
    return _nets[name]


grids, strides = [], []
for s in (8, 16, 32):
    n = SIZE // s
    xv, yv = np.meshgrid(np.arange(n), np.arange(n))
    grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
    strides.append(np.full((n * n, 1), s))
GRIDS = np.concatenate(grids).astype(np.float32)
STRIDES = np.concatenate(strides).astype(np.float32)
COLORS = np.random.default_rng(3).integers(40, 256, (80, 3)).tolist()

cv.namedWindow('result')
cv.createTrackbar('model', 'result', 0, 1, lambda x: None)
cv.createTrackbar('confidence', 'result', 40, 95, lambda x: None)
get_net(0)
print('YOLOX 모델 준비 완료 — COCO 80종 물체를 인식합니다.')


def process(frame):
    mi = cv.getTrackbarPos('model', 'result')
    conf_th = max(5, cv.getTrackbarPos('confidence', 'result')) / 100.0
    net = get_net(mi)
    h, w = frame.shape[:2]
    r = min(SIZE / h, SIZE / w)
    nh, nw = int(round(h * r)), int(round(w * r))
    pad = np.full((SIZE, SIZE, 3), 114, np.uint8)
    pad[:nh, :nw] = cv.resize(frame, (nw, nh), interpolation=cv.INTER_LINEAR)

    net.setInput(cv.dnn.blobFromImage(pad))
    t0 = time.perf_counter()
    pred = net.forward()[0]
    ms = (time.perf_counter() - t0) * 1000

    xy = (pred[:, :2] + GRIDS) * STRIDES
    wh = np.exp(pred[:, 2:4]) * STRIDES
    scores = pred[:, 4:5] * pred[:, 5:]
    cls = scores.argmax(1)
    conf = scores[np.arange(len(cls)), cls]
    keep = conf >= conf_th
    boxes = (np.concatenate([xy - wh / 2, wh], 1)[keep] / r)
    cls, conf = cls[keep], conf[keep]

    out = frame.copy()
    counts = {}
    th = max(2, int(round(max(h, w) / 320)))
    fs = max(0.45, max(h, w) / 1100)
    if len(boxes):
        idx = np.array(cv.dnn.NMSBoxes(boxes.tolist(), conf.tolist(), conf_th, 0.45)).flatten()
        for i in idx:
            x, y, bw, bh = boxes[i]
            x1, y1 = int(max(0, x)), int(max(0, y))
            x2, y2 = int(min(w - 1, x + bw)), int(min(h - 1, y + bh))
            name = CLASSES[cls[i]]
            counts[name] = counts.get(name, 0) + 1
            color = COLORS[cls[i]]
            cv.rectangle(out, (x1, y1), (x2, y2), color, th)
            label = '%s %d%%' % (name, conf[i] * 100)
            (tw, tth), base = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, fs, 1)
            ty = y1 - 4 if y1 - tth - 8 > 0 else y1 + tth + 6
            cv.rectangle(out, (x1, ty - tth - 4), (x1 + tw + 6, ty + 3), color, -1)
            cv.putText(out, label, (x1 + 3, ty), cv.FONT_HERSHEY_SIMPLEX, fs, (0, 0, 0), 1, cv.LINE_AA)

    # 상단 정보 패널
    lines = ['%s  %.0f ms' % (MODELS[mi][0], ms)]
    summary = '  '.join('%s %d' % (k, v) for k, v in sorted(counts.items(), key=lambda kv: -kv[1]))
    lines.append(summary if summary else 'no objects')
    pw = max(cv.getTextSize(t, cv.FONT_HERSHEY_SIMPLEX, 0.55, 1)[0][0] for t in lines) + 16
    panel = out[0:52, 0:min(w, pw)]
    out[0:52, 0:min(w, pw)] = (panel * 0.35).astype(np.uint8)
    for k, t in enumerate(lines):
        cv.putText(out, t, (8, 20 + k * 22), cv.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv.LINE_AA)
    return out
`,
  },

  /* ----------------------------------------------------------------- 얼굴 */
  {
    id: 'face',
    cat: 'dnn',
    icon: '🙂',
    title: '얼굴 검출 · 개인정보 모자이크',
    subtitle: '딥러닝으로 얼굴과 눈 · 코 · 입 위치를 찾고, 자동으로 모자이크 처리',
    summary: `<p>OpenCV 에 내장된 <code>cv.FaceDetectorYN</code> 과 초경량 얼굴 검출 모델 <b>YuNet</b>(약 230KB, MIT)을 사용합니다.
      얼굴 상자와 함께 <b>눈 2개 · 코 · 입꼬리 2개</b>의 위치(5개 랜드마크)를 찾아냅니다.</p>
      <p>찾은 얼굴 영역만 크게 줄였다 늘리면 <b>모자이크</b>, 블러를 적용하면 <b>흐림 처리</b>가 됩니다 — 뉴스 · CCTV 영상의 개인정보 비식별화 방식입니다.</p>`,
    uses: [
      ['개인정보 보호 (비식별화)', 'CCTV · 블랙박스 · 거리뷰 영상 공개 전에 얼굴을 자동으로 모자이크'],
      ['카메라 · 스마트폰', '얼굴에 초점 · 노출 맞추기, 인물 사진 모드, 셀카 필터 위치 잡기'],
      ['출입 통제 · 근태', '얼굴 인식(누구인지 확인) 전에 얼굴 위치를 먼저 찾는 첫 단계'],
      ['운전자 모니터링', '졸음 · 전방 주시 태만 감지를 위한 얼굴 · 눈 위치 추적'],
    ],
    steps: [
      '<code>cv.FaceDetectorYN.create</code> 로 YuNet 모델 불러오기 (한 번만)',
      '처리 속도를 위해 긴 변이 640픽셀이 넘으면 축소',
      '<code>detector.setInputSize</code> 로 입력 크기를 알려주고 <code>detect</code> 실행',
      '결과(얼굴마다 상자 4개 값 + 랜드마크 10개 값 + 점수)를 원래 크기로 되돌림',
      '모드에 따라 상자 · 랜드마크 그리기 / 얼굴 영역 모자이크 / 블러 적용',
    ],
    tech: ['cv.FaceDetectorYN', 'detector.detect', 'cv.resize (INTER_NEAREST 모자이크)', 'cv.GaussianBlur', 'cv.circle'],
    controls: [
      ['mode', '0 = 상자와 랜드마크 표시 · 1 = 모자이크 · 2 = 블러'],
      ['score', '얼굴로 인정할 최소 점수(%)'],
    ],
    inputs: ['messi5.jpg', 'lena.jpg', 'camera', 'video:Megamind.mp4'],
    assets: ['face_detection_yunet_2023mar.onnx'],
    note: '브라우저에서 한 장에 약 0.1~0.2초입니다. 📷 웹캠으로 자기 얼굴을 비추고 mode 를 1로 바꿔 보세요.',
    refs: [
      ['OpenCV: Face Detection (YuNet) tutorial', 'https://docs.opencv.org/4.x/d0/dd4/tutorial_dnn_face.html'],
      ['OpenCV Zoo — face_detection_yunet', 'https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet'],
    ],
    code: String.raw`
import cv2 as cv
import numpy as np

detector = cv.FaceDetectorYN.create('face_detection_yunet_2023mar.onnx', '', (320, 320), 0.6, 0.3, 5000)
cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 0, 2, lambda x: None)
cv.createTrackbar('score', 'result', 60, 99, lambda x: None)
MODES = ['detect', 'mosaic', 'blur']
LM_COLORS = [(255, 0, 0), (0, 0, 255), (0, 255, 0), (255, 0, 255), (0, 255, 255)]
print('YuNet 얼굴 검출기 준비 완료')


def process(frame):
    mode = cv.getTrackbarPos('mode', 'result')
    detector.setScoreThreshold(max(10, cv.getTrackbarPos('score', 'result')) / 100.0)
    h, w = frame.shape[:2]
    s = min(1.0, 640.0 / max(h, w))
    small = cv.resize(frame, (int(w * s), int(h * s))) if s < 1 else frame
    detector.setInputSize((small.shape[1], small.shape[0]))
    _, faces = detector.detect(small)
    out = frame.copy()
    n = 0 if faces is None else len(faces)
    th = max(2, int(max(h, w) / 300))
    for f in (faces if faces is not None else []):
        x, y, bw, bh = (f[:4] / s).astype(int)
        x1, y1, x2, y2 = max(0, x), max(0, y), min(w, x + bw), min(h, y + bh)
        if x2 <= x1 or y2 <= y1:
            continue
        roi = out[y1:y2, x1:x2]
        if mode == 1:
            k = max(4, (x2 - x1) // 10)
            tiny = cv.resize(roi, (max(1, (x2 - x1) // k), max(1, (y2 - y1) // k)), interpolation=cv.INTER_LINEAR)
            out[y1:y2, x1:x2] = cv.resize(tiny, (x2 - x1, y2 - y1), interpolation=cv.INTER_NEAREST)
        elif mode == 2:
            kk = ((x2 - x1) // 3) | 1
            out[y1:y2, x1:x2] = cv.GaussianBlur(roi, (kk, kk), 0)
        else:
            cv.rectangle(out, (x1, y1), (x2, y2), (0, 255, 0), th)
            for j in range(5):
                px, py = (f[4 + 2 * j:6 + 2 * j] / s).astype(int)
                cv.circle(out, (int(px), int(py)), th + 1, LM_COLORS[j], -1)
            cv.putText(out, '%.0f%%' % (f[-1] * 100), (x1, max(15, y1 - 6)), cv.FONT_HERSHEY_SIMPLEX, 0.5 + th * 0.1, (0, 255, 0), max(1, th - 1), cv.LINE_AA)
    label = 'faces: %d   mode: %s' % (n, MODES[mode])
    (tw, tth), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.6, 1)
    out[0:tth + 16, 0:tw + 16] = (out[0:tth + 16, 0:tw + 16] * 0.35).astype(np.uint8)
    cv.putText(out, label, (8, tth + 8), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv.LINE_AA)
    return out
`,
  },

  /* -------------------------------------------------------------- 사람 분할 */
  {
    id: 'segment',
    cat: 'dnn',
    icon: '🧍',
    title: '사람 분할 · 가상 배경',
    subtitle: '픽셀 단위로 사람과 배경을 나눠 배경을 바꾸거나 흐리게',
    summary: `<p><b>영상 분할(Segmentation)</b>은 상자가 아니라 <b>픽셀 하나하나</b>가 사람인지 배경인지를 판단합니다.
      이 데모는 Baidu PaddleSeg 의 <b>PP-HumanSeg</b> 모델(OpenCV Zoo, Apache-2.0)로 사람 영역 확률 지도를 만든 뒤,
      강좌에서 배운 <b>가중치 합성(블렌딩)</b>으로 배경을 다른 그림으로 바꾸거나 흐리게 처리합니다.</p>`,
    uses: [
      ['화상회의', 'Zoom · Teams 의 가상 배경과 배경 흐림 기능'],
      ['방송 · 영상 제작', '크로마키(초록 배경) 없이 인물만 분리해 합성'],
      ['사진 편집 · 쇼핑', '인물 · 상품 누끼(배경 제거) 자동화, 프로필 사진 배경 정리'],
      ['피트니스 · 모션 분석', '사람 실루엣으로 자세 · 동작 분석의 전처리'],
    ],
    steps: [
      '프레임을 RGB 로 바꾸고 모델 입력 크기 <code>192×192</code> 로 축소',
      '픽셀값을 -1~1 범위로 정규화한 뒤 <code>blobFromImage</code>',
      '<code>net.forward()</code> → [배경, 사람] 2개 채널 점수 → softmax 로 사람일 확률 지도',
      '확률 지도를 원래 크기로 키우고 살짝 블러해 경계를 부드럽게 (알파 마스크)',
      '<code>결과 = 원본 × 알파 + 새 배경 × (1 − 알파)</code> 로 합성',
    ],
    tech: ['cv.dnn.readNetFromONNX', 'cv.dnn.blobFromImage', 'cv.resize', 'cv.GaussianBlur', '알파 블렌딩 (NumPy)'],
    controls: [
      ['mode', '0 = 사람 영역 표시 · 1 = 가상 배경(고흐 그림) · 2 = 배경 흐림'],
      ['threshold', '사람으로 볼 확률 기준(%) — 경계가 너무 넓거나 좁을 때 조절'],
    ],
    inputs: ['lena.jpg', 'messi5.jpg', 'camera'],
    assets: ['human_segmentation_pphumanseg_2023mar.onnx'],
    note: '브라우저에서 한 장에 약 0.3초입니다. 입력이 작은(192×192) 모델이라 머리카락 같은 세밀한 경계는 거칠 수 있습니다.',
    refs: [
      ['OpenCV Zoo — human_segmentation_pphumanseg', 'https://github.com/opencv/opencv_zoo/tree/main/models/human_segmentation_pphumanseg'],
      ['OpenCV: Arithmetic Operations on Images (블렌딩)', 'https://docs.opencv.org/4.x/d0/d86/tutorial_py_image_arithmetics.html'],
    ],
    code: String.raw`
import cv2 as cv
import numpy as np

net = cv.dnn.readNetFromONNX('human_segmentation_pphumanseg_2023mar.onnx')
background = cv.imread('starry_night.jpg')
cv.namedWindow('result')
cv.createTrackbar('mode', 'result', 1, 2, lambda x: None)
cv.createTrackbar('threshold', 'result', 50, 95, lambda x: None)
MODES = ['person mask', 'virtual background', 'background blur']
print('PP-HumanSeg 모델 준비 완료')


def process(frame):
    mode = cv.getTrackbarPos('mode', 'result')
    th = max(5, cv.getTrackbarPos('threshold', 'result')) / 100.0
    h, w = frame.shape[:2]
    x = cv.resize(cv.cvtColor(frame, cv.COLOR_BGR2RGB), (192, 192)).astype(np.float32) / 255.0
    x = (x - 0.5) / 0.5
    net.setInput(cv.dnn.blobFromImage(x))
    logits = net.forward()[0]
    e = np.exp(logits - logits.max(0))
    prob = (e[1] / e.sum(0)).astype(np.float32)
    prob = cv.resize(prob, (w, h), interpolation=cv.INTER_LINEAR)
    alpha = np.clip((prob - th) / 0.2 + 0.5, 0, 1)
    alpha = cv.GaussianBlur(alpha, (0, 0), max(1.0, max(h, w) / 400))[:, :, None]

    if mode == 0:
        tint = frame.copy()
        tint[:] = (0, 200, 0)
        out = (frame * (1 - alpha * 0.45) + tint * (alpha * 0.45)).astype(np.uint8)
        dark = (alpha < 0.5)[:, :, 0]
        out[dark] = (out[dark] * 0.45).astype(np.uint8)
        edge = cv.Canny((alpha[:, :, 0] * 255).astype(np.uint8), 60, 140)
        out[edge > 0] = (0, 255, 0)
    else:
        if mode == 1:
            bg = cv.resize(background, (w, h), interpolation=cv.INTER_AREA)
        else:
            small = cv.resize(frame, (max(1, w // 4), max(1, h // 4)), interpolation=cv.INTER_AREA)
            bg = cv.resize(cv.GaussianBlur(small, (0, 0), 4), (w, h), interpolation=cv.INTER_LINEAR)
        out = (frame * alpha + bg * (1 - alpha)).astype(np.uint8)

    ratio = float((alpha > 0.5).mean()) * 100
    label = '%s   person %.0f%%' % (MODES[mode], ratio)
    (tw, tth), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.6, 1)
    out[0:tth + 16, 0:tw + 16] = (out[0:tth + 16, 0:tw + 16] * 0.35).astype(np.uint8)
    cv.putText(out, label, (8, tth + 8), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv.LINE_AA)
    return out
`,
  },

  /* ------------------------------------------------------------- 글자 영역 */
  {
    id: 'text',
    cat: 'dnn',
    icon: '🔤',
    title: '글자 영역 검출 (OCR 전처리)',
    subtitle: '간판 · 문서 사진에서 글자가 있는 줄을 찾아 똑바로 펴기',
    summary: `<p>사진 속 글자를 읽는 <b>OCR(광학 문자 인식)</b>은 보통 두 단계입니다: ① 글자가 있는 영역 찾기 → ② 영역 안의 글자 읽기.
      이 데모는 ①단계로, PaddleOCR 의 <b>PP-OCRv3 DB 검출 모델</b>(OpenCV Zoo, Apache-2.0)을 <code>cv.dnn.TextDetectionModel_DB</code> 로 실행해
      기울어지거나 원근이 있는 글자 줄도 네 꼭짓점으로 찾아냅니다.</p>
      <p>찾은 영역은 강좌에서 배운 <b>원근 변환</b>으로 반듯한 직사각형으로 펴서 <code>text lines</code> 창에 모아 보여줍니다 — 이것이 글자 인식 모델의 입력이 됩니다.</p>`,
    uses: [
      ['차량 번호판 인식', '주차장 · 톨게이트에서 번호판 영역을 찾고 번호를 읽기'],
      ['문서 디지털화', '영수증 · 명함 · 계약서 사진을 텍스트로 변환 (스캐너 앱)'],
      ['물류 · 제조', '택배 송장, 제품 라벨의 날짜 · 로트 번호 읽기'],
      ['지도 · 번역 앱', '거리 간판 · 메뉴판 글자를 찾아 실시간 번역'],
    ],
    steps: [
      '<code>cv.dnn.TextDetectionModel_DB</code> 로 모델 불러오고 입력 크기 · 평균값 · 임계값 설정',
      '<code>model.detect(frame)</code> — 글자일 확률 지도를 만들고 이진화해 글자 줄 윤곽을 찾음',
      '각 윤곽을 네 꼭짓점(사각형)으로 정리하고 번호를 매김',
      '네 꼭짓점을 좌상 · 우상 · 우하 · 좌하 순서로 정렬',
      '<code>cv.getPerspectiveTransform</code> + <code>cv.warpPerspective</code> 로 각 줄을 반듯하게 펴서 세로로 쌓기',
    ],
    tech: ['cv.dnn.TextDetectionModel_DB', 'model.detect', 'cv.polylines', 'cv.getPerspectiveTransform', 'cv.warpPerspective', 'np.vstack'],
    controls: [
      ['size', '모델 입력 크기 0 = 320 (빠름) · 1 = 480 · 2 = 640 (작은 글자에 유리)'],
    ],
    inputs: ['text_signs.png', 'imageTextR.png', 'camera'],
    assets: ['text_detection_en_ppocrv3_2023may.onnx', 'text_signs.png', 'imageTextR.png'],
    note: '이 데모는 글자 “영역”까지만 찾습니다. 글자를 읽는 인식 모델(CRNN 등)을 더하면 완전한 OCR 이 됩니다. 브라우저에서 한 장에 약 0.2~0.8초.',
    refs: [
      ['OpenCV: High Level API: TextDetectionModel and TextRecognitionModel', 'https://docs.opencv.org/4.x/d4/d43/tutorial_dnn_text_spotting.html'],
      ['OpenCV Zoo — text_detection_ppocr', 'https://github.com/opencv/opencv_zoo/tree/main/models/text_detection_ppocr'],
    ],
    code: String.raw`
import cv2 as cv
import numpy as np

model = cv.dnn.TextDetectionModel_DB('text_detection_en_ppocrv3_2023may.onnx')
model.setBinaryThreshold(0.3)
model.setPolygonThreshold(0.5)
model.setMaxCandidates(200)
model.setUnclipRatio(2.0)
MEAN = (122.67891434, 116.66876762, 104.00698793)
SIZES = [320, 480, 640]
cv.namedWindow('result')
cv.createTrackbar('size', 'result', 1, 2, lambda x: None)
print('PP-OCRv3 글자 검출 모델 준비 완료')


def order_points(q):
    q = np.asarray(q, np.float32)
    s = q.sum(1)
    d = np.diff(q, axis=1).ravel()
    return np.float32([q[np.argmin(s)], q[np.argmin(d)], q[np.argmax(s)], q[np.argmax(d)]])


def process(frame):
    size = SIZES[cv.getTrackbarPos('size', 'result')]
    model.setInputParams(1.0 / 255.0, (size, size), MEAN)
    quads, confs = model.detect(frame)
    out = frame.copy()
    h, w = frame.shape[:2]
    strips = []
    items = sorted([order_points(q) for q in quads], key=lambda p: (round(p[:, 1].mean() / 20), p[:, 0].mean()))
    for i, p in enumerate(items):
        cv.polylines(out, [p.astype(np.int32)], True, (0, 255, 0), 2, cv.LINE_AA)
        tl = p[0].astype(int)
        cv.putText(out, str(i + 1), (int(tl[0]), max(14, int(tl[1]) - 4)), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2, cv.LINE_AA)
        bw = int(max(np.linalg.norm(p[1] - p[0]), np.linalg.norm(p[2] - p[3])))
        bh = int(max(np.linalg.norm(p[3] - p[0]), np.linalg.norm(p[2] - p[1])))
        if bw < 8 or bh < 6:
            continue
        M = cv.getPerspectiveTransform(p, np.float32([[0, 0], [bw, 0], [bw, bh], [0, bh]]))
        strip = cv.warpPerspective(frame, M, (bw, bh))
        strip = cv.resize(strip, (max(1, int(bw * 40 / bh)), 40))
        strips.append(strip)
    if strips:
        W = min(900, max(s.shape[1] for s in strips))
        rows = []
        for i, s in enumerate(strips):
            row = np.full((48, W + 40, 3), 255, np.uint8)
            s = s[:, :W]
            row[4:44, 36:36 + s.shape[1]] = s
            cv.putText(row, str(i + 1), (6, 32), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2, cv.LINE_AA)
            rows.append(row)
        cv.imshow('text lines', np.vstack(rows))
    label = 'text regions: %d   input %d' % (len(items), size)
    (tw, tth), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.6, 1)
    out[0:tth + 16, 0:tw + 16] = (out[0:tth + 16, 0:tw + 16] * 0.35).astype(np.uint8)
    cv.putText(out, label, (8, tth + 8), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv.LINE_AA)
    return out
`,
  },
);
