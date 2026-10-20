# Простые числа — видео на Remotion

Ролик ~3 минуты (1920×1080, 30 fps) о теории простых чисел с русской озвучкой.
Композиция `PrimesVideo` собрана из 9 сцен, соединённых плавными переходами:

1. **Intro** — «Простые числа. Атомы арифметики»
2. **Definition** — определение, примеры простых и составных чисел
3. **Sieve** — анимированное решето Эратосфена для чисел 1–100
4. **Factorization** — основная теорема арифметики: два дерева разложения 60
5. **Euclid** — доказательство Евклида, что простых бесконечно много
6. **Distribution** — график π(x) против x / ln x (теорема о распределении простых)
7. **Cryptography** — почему разложение на множители защищает RSA
8. **OpenProblems** — гипотеза Римана, простые-близнецы, гипотеза Гольдбаха
9. **Outro**

Каждая сцена зарегистрирована отдельной композицией в папке `Scenes`, поэтому
в Remotion Studio её можно открыть и редактировать отдельно.

## Озвучка

Текст озвучки лежит в `scripts/narration.json`, готовые фразы — в `public/voiceover/`.
Каждая сцена проигрывает свои фразы на дорожке «Voiceover», а появление элементов
на экране привязано к моменту, когда о них говорят.

Фразы синтезированы офлайн голосом Piper `ru_RU-irina-medium` через sherpa-onnx,
без API-ключей. Чтобы пересоздать их после правки текста:

```console
pip install sherpa-onnx soundfile
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-irina-medium.tar.bz2
tar xjf vits-piper-ru_RU-irina-medium.tar.bz2
python scripts/generate_voiceover.py --model-dir vits-piper-ru_RU-irina-medium
```

Скрипт печатает длительность каждой фразы. Если она заметно изменилась, поправьте
`from` у фразы и связанных с ней элементов в сцене и длительность сцены в
`src/PrimesVideo.tsx` и `src/Root.tsx`.

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
npx remotion render PrimesVideo out/primes-video.mp4
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
