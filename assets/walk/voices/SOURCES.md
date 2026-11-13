# 普通话驻足讲解 · 第二版

讲解是按本馆中文讲稿离线合成的普通话，不是真人现场录音；无需联网配音、调用麦克风或使用访客设备上的系统声音。两处播放入口共用一个声道。全部 139 段使用同一内建中文发声人，没有采集或克隆任何访客的声音。书面图注保留历史用字；recordings.json 的 transcript 是实际口播的可读文字。

声音使用 MyShell [MeloTTS Chinese](https://huggingface.co/myshell-ai/MeloTTS-Chinese) 的单一 ZH 音色，[sherpa-onnx 转换与示例](https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/vits.html)。模型为 MIT，[原许可](model-LICENSE.txt)。模型参数不在网页或公开包中。原创讲稿与音频在 ShiKu 有权授权的范围内按 [CC BY 4.0，署名 ShiKu](../../../CONTENT-LICENSE.md) 提供，原模型许可与声音相关权利保持独立。

重建：在独立 Python 环境使用 sherpa-onnx 1.12.40、NumPy 2.2.6、Node 与 FFmpeg。取 [固定版本的模型与词典](https://huggingface.co/csukuangfj/vits-melo-tts-zh_en/tree/a0d5c6a264c0ef92d70d8661d8cc502d79627cd6) 中 model.onnx、lexicon.txt、tokens.txt。运行 `python -B scripts/render-walk-voices.py --model 模型目录 --output 新的空目录`。模型 SHA-256 为 bf30582eb1b012250a35b1a4a80e7dfbcf8485e7bb9de0d95efbbeef0e4ad86d。原生 44.1 kHz 单声道，统一响度后存为 96 kb/s MP3。更新讲稿、发音词典或渲染配方都会要求重新生成相应录音。更新文件后运行 `node scripts/check-interpretation.mjs`。
