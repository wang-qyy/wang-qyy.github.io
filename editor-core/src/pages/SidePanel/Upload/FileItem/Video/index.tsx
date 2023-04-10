import AutoDestroyVideo from '@/components/AutoDestroyVideo';
import { formatNumberToTime } from '@/utils/single';

interface VideoProps {
  poster: string;
  src: string;
  duration: string;
}

export default function Video({ poster, src, duration }: VideoProps) {
  return (
    <>
      <AutoDestroyVideo poster={poster} src={src} />
      {/* <div className="upload-file-item-duration">
        {formatNumberToTime(parseInt(duration))}
      </div> */}
    </>
  );
}
