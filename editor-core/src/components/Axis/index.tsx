import Handle from './Handle';
import Rail, { RailProps } from './Rail';
import Track, { TrackProps } from './Track';

export interface AxisProps extends RailProps, TrackProps {}

export default function Axis(props: AxisProps) {
  const {
    assetUrl,
    assetHeight,
    assetWidth,
    duration,
    startTime,
    endTime,
    onChange,
  } = props;

  return (
    <>
      <Rail
        assetUrl={assetUrl}
        assetHeight={assetHeight}
        assetWidth={assetWidth}
        duration={duration}
      />
      <Track
        startTime={startTime}
        endTime={endTime}
        onChange={onChange}
        duration={duration}
      />
    </>
  );
}

export { Handle, Rail, Track, RailProps, TrackProps };
