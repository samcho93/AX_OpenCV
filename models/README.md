# 응용 예제용 딥러닝 모델

| 파일 | 모델 | 출처 | 라이선스 |
|---|---|---|---|
| `yolox_nano.onnx`, `yolox_tiny.onnx` | YOLOX-Nano / YOLOX-Tiny (COCO 80 클래스 객체 검출) | [Megvii-BaseDetection/YOLOX](https://github.com/Megvii-BaseDetection/YOLOX) release 0.1.1rc0 | Apache-2.0 |
| `face_detection_yunet_2023mar.onnx` | YuNet 얼굴 검출 | [OpenCV Zoo](https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet) | MIT |
| `human_segmentation_pphumanseg_2023mar.onnx` | PP-HumanSeg 사람 분할 | [OpenCV Zoo](https://github.com/opencv/opencv_zoo/tree/main/models/human_segmentation_pphumanseg) (PaddleSeg) | Apache-2.0 |
| `text_detection_en_ppocrv3_2023may.onnx` | PP-OCRv3 DB 글자 영역 검출 | [OpenCV Zoo](https://github.com/opencv/opencv_zoo/tree/main/models/text_detection_ppocr) (PaddleOCR) | Apache-2.0 |

이미지 출처: `images/apps/street.png`, `dog416.png` — [opencv/opencv_extra](https://github.com/opencv/opencv_extra) testdata/dnn,
`imageTextR.png` — [opencv/opencv](https://github.com/opencv/opencv) samples/data. 그 밖의 `images/apps/*.png` 는 `tools/gen_app_images_*.py` 로 만든 교육용 합성 이미지입니다.
