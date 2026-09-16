import type {CSSProperties} from 'react';
import {Audio, Sequence, Composition, Img, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import './travel-album-book.css';

const STRIPS = 18;
// Analytic damped spring, matching the reference's stiffness 150 and damping 22.
export const leafProgress = (seconds: number) => {
  const t = Math.max(0, seconds);
  const frequency = Math.sqrt(150 - 11 * 11);
  return Math.max(0, Math.min(1, 1 - Math.exp(-11 * t) * (Math.cos(frequency * t) + 11 / frequency * Math.sin(frequency * t))));
};

const Leaf = ({from, progress, WIDTH, HEIGHT, vertical, url}: {from: number; progress: number; WIDTH: number; HEIGHT: number; vertical: boolean; url: (i: number) => string}) => {
  const bend = .6 * Math.sin(Math.PI * progress);
  const angle = Math.PI * progress + bend;
  const delta = 2 * bend / STRIPS;
  const sw = (vertical ? HEIGHT : WIDTH) / 2 / STRIPS;
  const strip = (index: number): React.ReactNode => {
    const near = Math.abs(Math.cos(angle - index * delta));
    const far = Math.abs(Math.cos(angle - (index + 1) * delta));
    const face = (back: boolean) => <div className={`ta-face ${back ? 'ta-back' : ''}`} style={{
      backgroundImage: `url("${url(from + (back ? 1 : 0))}")`,
      right: vertical ? 0 : index === STRIPS - 1 ? 0 : -1.1,
      bottom: vertical ? index === STRIPS - 1 ? 0 : -1.1 : 0,
      transformOrigin: back ? vertical ? `50% ${sw / 2}px` : `${sw / 2}px 50%` : undefined,
      backgroundPositionX: vertical ? 0 : back ? (index + 1) * sw - WIDTH / 2 : -WIDTH / 2 - index * sw,
      backgroundPositionY: vertical ? back ? (index + 1) * sw - HEIGHT / 2 : -HEIGHT / 2 - index * sw : 0,
      borderRadius: index === STRIPS - 1 ? vertical ? back ? 'var(--ta-radius) var(--ta-radius) 0 0' : '0 0 var(--ta-radius) var(--ta-radius)' : back ? 'var(--ta-radius) 0 0 var(--ta-radius)' : '0 var(--ta-radius) var(--ta-radius) 0' : 0,
    }}><div className="ta-face-shade" style={{background: `linear-gradient(${vertical ? 180 : 90}deg,rgba(58,43,20,${(1 - (back ? far : near)) * .62}),rgba(58,43,20,${(1 - (back ? near : far)) * .62}))`}} /><div className="ta-face-light" style={{opacity: Math.sin(Math.PI * progress) * near * near * .2}} /></div>;
    return <div className="ta-strip" key={index} style={{left: 0, width: vertical ? '100%' : sw, height: vertical ? sw : '100%', transform: vertical ? `${index ? `translateY(${sw}px) ` : ''}rotateX(${index ? -delta : angle}rad)` : `${index ? `translateX(${sw}px) ` : ''}rotateY(${index ? delta : -angle}rad)`}}>
      {face(false)}{face(true)}{index < STRIPS - 1 && strip(index + 1)}
    </div>;
  };
  return <div className="ta-leaf">{strip(0)}</div>;
};

export const TravelAlbumBook = ({images, imageRatio, stillIndex, verticalTurn = false, duration = 2, pageFlipSound = false}: {pageFlipSound?: boolean; images: string[]; imageRatio: number; stillIndex?: number; verticalTurn?: boolean; duration?: number}) => {
  const {width, height} = useVideoConfig();
  const fill = stillIndex === undefined ? .8 : .91;
  const WIDTH = Math.min(width * fill, height * fill * imageRatio);
  const HEIGHT = WIDTH / imageRatio;
  const longEdge = verticalTurn ? HEIGHT : WIDTH;
  const url = (i: number) => staticFile(images[i]);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = stillIndex === undefined ? frame / fps : 2;
  const index = stillIndex ?? Math.min(images.length - 1, Math.max(0, Math.floor((time - 2) / (duration + 1))));
  const local = time - (2 + index * (duration + 1));
  const inTurn = stillIndex === undefined && index < images.length - 1 && local >= duration;
  const progress = inTurn ? leafProgress(local - duration) : 0;
  const turning = inTurn && progress < 1;
  const restingIndex = inTurn && !turning ? index + 1 : index;
  const shade = Math.sin(Math.PI * progress);
  const zoom = .985 + .015 * Math.sin(Math.min(1, time / 2) * Math.PI / 2);
  return <div className={`ta-stage${verticalTurn ? ' ta-vertical' : ''}`} style={{'--ta-width': `${WIDTH}px`, '--ta-height': `${HEIGHT}px`, '--ta-unit': `${longEdge / 1536}px`, '--ta-radius': `${Math.min(longEdge * .0185, Math.min(WIDTH, HEIGHT) * .1)}px`, perspective: (verticalTurn ? height : width) * 1750 / 1920} as CSSProperties}>
    {pageFlipSound && stillIndex === undefined && images.slice(1).map((_, i) => <Sequence key={`sound-${i}`} from={Math.round((2 + duration + i * (duration + 1)) * fps)} durationInFrames={Math.round(.7 * fps)} layout="none"><Audio src={staticFile('page-flip.wav')} volume={1} /></Sequence>)}
    {images.map((src, i) => <Img key={i} src={staticFile(src)} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />)}
    <div className="ta-scene" style={{transform: `translate(-50%,-50%) scale(${zoom})`}}>
      <div className="ta-shadow" style={{opacity: 1 - shade * .42}} />
      <div className="ta-cover" /><div className="ta-page-stack" /><div className="ta-page-rim" />
      {turning ? <>
        <div className="ta-static ta-left" style={{backgroundImage: `url("${url(index)}")`}} />
        <div className="ta-static ta-right" style={{backgroundImage: `url("${url(index + 1)}")`}} />
      </> : <div className="ta-spread" style={{backgroundImage: `url("${url(restingIndex)}")`}} />}
      {turning && <><div className="ta-cast-left" style={{opacity: shade * .62}} /><div className="ta-cast-right" style={{opacity: shade * .62}} /><Leaf from={index} progress={progress} WIDTH={WIDTH} HEIGHT={HEIGHT} vertical={verticalTurn} url={url} /></>}
      <div className="ta-gutter" />
    </div>
  </div>;
};

registerRoot(() => <Composition id="Album" component={TravelAlbumBook} width={3840} height={2160} fps={60} durationInFrames={420} defaultProps={{images: [] as string[], imageRatio: 2.26, width: 3840, height: 2160, fps: 60, durationInFrames: 420}} calculateMetadata={({props}) => ({width: props.width, height: props.height, fps: props.fps, durationInFrames: props.durationInFrames})} />);
