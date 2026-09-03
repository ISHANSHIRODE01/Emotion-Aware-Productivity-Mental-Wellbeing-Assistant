# Evaluation Status

This document tracks what has and has not been measured in this project.
It replaces an earlier `IMPACT_METRICS.md` that contained unverified performance
claims. Any number that is not reproducible from code in this repository has
been removed.

## Current status: not yet benchmarked

The system is a working multimodal prototype. The pipeline runs end to end
(text / audio / face -> per-modality probabilities -> weighted fusion ->
wellbeing score -> recommendation), but **no classification accuracy,
latency, or throughput figure has been measured on a labelled dataset.**

## What is actually implemented and verifiable

| Component | Implementation | Verifiable by |
|---|---|---|
| Text emotion | `j-hartmann/emotion-english-distilroberta-base` | `backend/services/text_emotion.py` |
| Audio emotion | Wav2Vec2-based classifier | `backend/services/audio_emotion.py` |
| Facial emotion | FER / deep CNN over detected face region | `backend/services/video_emotion.py` |
| Late fusion | Weighted probability fusion with missing-modality renormalisation | `backend/services/fusion.py` |
| Persistence | SQLite session store | `backend/database.py` |
| API | FastAPI, multipart upload | `backend/api.py` |

The fusion logic in `backend/services/fusion.py` correctly renormalises weights
when a modality is absent, which is the non-trivial part of the implementation
and is unit-testable independently of model accuracy.

## What was previously claimed without evidence

The following claims appeared in an earlier version of this repository and are
**withdrawn** because no experiment in this codebase supports them:

- "95%+ emotion classification accuracy"
- "<100ms text / <500ms audio latency"
- "improved user engagement by 40%"
- "60% memory reduction via quantization" (no quantization step exists in the code)
- "99.9% uptime, 50+ concurrent requests" (no load test exists)
- "1000+ user sessions tracked" (no such dataset exists)
- "7x inference speedup via TFLite" (no TFLite conversion exists in the code)

Removing these is deliberate. An unverified number is worse than no number,
because it cannot survive a single follow-up question.

## Planned benchmark protocol

To replace the withdrawn claims with real measurements:

### Text modality
- **Dataset:** GoEmotions (Demszky et al., 2020), mapped down to the 7-class
  Ekman set used by this system.
- **Metric:** macro-F1 and per-class F1, since emotion datasets are heavily
  imbalanced toward `neutral`. Accuracy alone is misleading here.
- **Baseline to beat:** majority-class predictor.

### Audio modality
- **Dataset:** RAVDESS (1440 clips, 24 actors, 8 emotions) with
  **speaker-independent** splits — actors in the test set must not appear in
  train, otherwise the model memorises voices and the score is inflated.
- **Metric:** macro-F1, plus a confusion matrix.

### Facial modality
- **Dataset:** FER2013 (35,887 images, 7 classes).
- **Metric:** macro-F1 against the published test split.

### Fusion
The central claim worth testing is that fusion beats the best single modality.
- **Protocol:** evaluate each modality alone, then fused, on the same aligned
  subset. Report the delta with a confidence interval.
- **Honest possibility:** late fusion with fixed hand-set weights
  (0.33/0.33/0.34) may *not* beat the strongest single modality. If it does not,
  that is the finding and it will be reported as such. A weight search or a
  learned fusion layer would be the follow-up.

### Latency
- **Protocol:** measure p50/p95 per modality over 100 runs on a documented
  CPU, cold and warm start reported separately.

## Reproducing

Benchmarks will live in `benchmarks/` with a single entry point and will write
results to `benchmarks/results/` as JSON, so every number in this file can be
traced to a command.

```bash
python -m benchmarks.run_all --modality all --output benchmarks/results/
```

Until that script exists and has been run, this project should be described as
a **functional prototype with unmeasured accuracy** — not as production-ready.
