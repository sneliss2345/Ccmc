# Гипотеза Римана — видео на Remotion

Ролик ~4:55 (1920×1080, 30 fps) с русской озвучкой о гипотезе Римана. Композиция
`RiemannVideo` собрана из 11 сцен (`src/scenes/`): простые числа и лестница π(x), статья
1859 года, дзета-функция и произведение Эйлера, комплексная плоскость, нули и сама гипотеза,
прогулка по критической прямой, явная формула Римана, что проверено, почему гипотезу до
сих пор не доказали, и финал.

- `scripts/compute_data.py` — точные данные через mpmath: первые 100 нулей, ζ(½ + it) и Z(t),
  явная формула для π(x), цветная карта ζ(s) (`public/zeta-domain.png`).
- `scripts/narration.json` — текст озвучки (ударения отмечены знаком U+0301, сложные слова —
  фонемами в `[[ ]]`); `scripts/generate_voiceover.py` синтезирует его офлайн голосом Piper
  `ru_RU-irina-medium` через `piper-tts` в `public/voiceover/` и этим задаёт тайминги сцен.
- `scripts/generate_voiceover_elevenlabs.py` и `scripts/generate_voiceover_speechkit.py`
  переозвучивают фразы ElevenLabs или Yandex SpeechKit, подгоняя каждую под длину прежней;
  в `public/voiceover/` сейчас голос SpeechKit `madirus`, растяжение по фразам — в
  `scripts/speechkit-report.json` (фразы, растянутые больше чем на 15%, перегенерированы с `--speed`).
- `src/components/Tex.tsx` — формулы KaTeX.

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render RiemannVideo out/riemann-video.mp4
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
